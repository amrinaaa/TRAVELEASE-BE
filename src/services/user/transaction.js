import prisma from "../../../prisma/prisma.client.js";

export default {
    async transactionHistoryService (userId) {
        try {
            // 1. Verifikasi apakah pengguna ada
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            // 2. Ambil semua transaksi untuk pengguna tersebut
            // Anda bisa menyertakan relasi lain jika diperlukan, misalnya detail tiket atau reservasi
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    // Contoh menyertakan detail tiket dan reservasi dalam transaksi
                    tickets: {
                        include: {
                            flight: {
                                include: {
                                    departureAirport: true,
                                    arrivalAirport: true,
                                    plane: {
                                        include: {
                                            airline: true
                                        }
                                    }
                                }
                            },
                            seat: {
                                include: {
                                    seatCategory: true
                                }
                            }
                        }
                    },
                    reservations: {
                        include: {
                            roomReservations: {
                                include: {
                                    room: {
                                        include: {
                                            roomType: {
                                                include: {
                                                    hotel: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
                // orderBy: {
                //     // Urutkan berdasarkan transaksi terbaru
                //     id: 'desc',
                // }
            });

            return transactions;
        } catch (error) {
            console.error("Error in getUserTransactionsService:", error); // Logging error
            throw new Error(error.message); // Melempar error agar bisa ditangani oleh controller
        }
    },

    async cancelTransactionService(userId, transactionId) {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Ambil transaksi dengan semua relasi dalam satu query
                const transaction = await tx.transaction.findUnique({
                    where: { id: transactionId },
                    include: {
                        user: { select: { id: true } },
                        tickets: {
                            include: {
                                flight: {
                                    select: { departureTime: true, planeId: true }
                                }
                            }
                        },
                        reservations: {
                            include: {
                                roomReservations: {
                                    include: {
                                        room: {
                                            include: {
                                                roomType: {
                                                    include: {
                                                        hotel: {
                                                            select: { id: true }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                // 2. Validasi dasar
                if (!transaction) throw new Error('Transaction not found');
                if (transaction.userId !== userId) throw new Error('User does not own this transaction');
                if (transaction.status === 'CANCELED') throw new Error('Order already cancelled');
                if (transaction.transactionType !== 'PURCHASE') throw new Error('Only purchase transactions can be cancelled');

                // 3. Cek konten transaksi
                const hasFlights = transaction.tickets.length > 0;
                const hasHotels = transaction.reservations.length > 0;
                
                if (!hasFlights && !hasHotels) {
                    await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: 'CANCELED' }
                    });
                    throw new Error('No content found: This transaction has no flights or hotels');
                }

                // 4. Tentukan tanggal terdekat untuk aturan pembatalan
                let earliestDate = null;

                // Untuk penerbangan
                if (hasFlights) {
                    for (const ticket of transaction.tickets) {
                        if (ticket.flight?.departureTime) {
                            const date = new Date(ticket.flight.departureTime);
                            if (!earliestDate || date < earliestDate) earliestDate = date;
                        }
                    }
                }

                // Untuk hotel
                if (hasHotels) {
                    for (const reservation of transaction.reservations) {
                        if (reservation.startDate) {
                            const date = new Date(reservation.startDate);
                            if (!earliestDate || date < earliestDate) earliestDate = date;
                        }
                    }
                }

                if (!earliestDate) throw new Error('Could not determine earliest date');

                // 5. Validasi waktu pembatalan
                const currentTime = new Date();
                if ((earliestDate.getTime() - currentTime.getTime()) < 2 * 24 * 60 * 60 * 1000) {
                    throw new Error(`Cancellation window has passed: Must be at least 2 days before (Earliest date: ${earliestDate.toISOString()})`);
                }

                // 6. Proses penghapusan data
                const deletePromises = [];

                if (hasFlights) {
                    deletePromises.push(
                        tx.ticket.deleteMany({ where: { transactionId } })
                    );
                }

                if (hasHotels) {
                    const reservationIds = transaction.reservations.map(r => r.id);
                    
                    if (reservationIds.length > 0) {
                        deletePromises.push(
                            tx.roomReservation.deleteMany({ 
                                where: { reservationId: { in: reservationIds } }
                            }),
                            tx.reservation.deleteMany({ 
                                where: { id: { in: reservationIds } }
                            })
                        );
                    }
                }

                await Promise.all(deletePromises);

                // 7. Proses refund jika sudah dibayar
                let refundData = null;
                
                if (transaction.status === 'PAID') {
                    // Refund ke user
                    await tx.user.update({
                        where: { id: userId },
                        data: { currentAmount: { increment: transaction.price } }
                    });

                    // Temukan partner untuk debit
                    const partnerIds = new Set();
                    
                    // Untuk penerbangan
                    if (hasFlights) {
                        const planeIds = [...new Set(transaction.tickets
                            .filter(t => t.flight?.planeId)
                            .map(t => t.flight.planeId))];
                        
                        if (planeIds.length > 0) {
                            const airlines = await tx.plane.findMany({
                                where: { id: { in: planeIds } },
                                select: { airlineId: true }
                            });
                            
                            const airlineIds = [...new Set(airlines.map(a => a.airlineId))];
                            
                            if (airlineIds.length > 0) {
                                const partners = await tx.airlinePartner.findMany({
                                    where: { airlineId: { in: airlineIds } },
                                    select: { partnerId: true }
                                });
                                
                                partners.forEach(p => partnerIds.add(p.partnerId));
                            }
                        }
                    }
                    
                    // Untuk hotel
                    if (hasHotels) {
                        const hotelIds = new Set();
                        
                        for (const reservation of transaction.reservations) {
                            for (const rr of reservation.roomReservations) {
                                if (rr.room?.roomType?.hotel?.id) {
                                    hotelIds.add(rr.room.roomType.hotel.id);
                                }
                            }
                        }
                        
                        if (hotelIds.size > 0) {
                            const partners = await tx.hotelPartner.findMany({
                                where: { hotelId: { in: [...hotelIds] } },
                                select: { partnerId: true }
                            });
                            
                            partners.forEach(p => partnerIds.add(p.partnerId));
                        }
                    }
                    
                    // Debit partner jika ditemukan
                    if (partnerIds.size > 0) {
                        const amountPerPartner = Math.floor(transaction.price / partnerIds.size);
                        const updatePromises = [];
                        
                        for (const partnerId of partnerIds) {
                            updatePromises.push(
                                tx.user.update({
                                    where: { id: partnerId },
                                    data: { currentAmount: { decrement: amountPerPartner } }
                                })
                            );
                        }
                        
                        await Promise.all(updatePromises);
                        refundData = {
                            refundedAmount: transaction.price,
                            debitedPartners: [...partnerIds],
                            amountPerPartner
                        };
                    } else {
                        throw new Error('Partner not found: No partners to debit');
                    }
                }
                
                // 8. Update status transaksi
                const updatedTransaction = await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'CANCELED' }
                });
                
                return {
                    status: updatedTransaction.status,
                    refundData
                };
            });
        } catch (error) {
            throw new Error(error.message)
        }
    },
};