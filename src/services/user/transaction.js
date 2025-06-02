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
                const transaction = await tx.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    user: true,
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
                                    hotel: true
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

                if (!transaction) {
                throw new Error("Transaction not found or invalid");
                }

                if (transaction.userId !== userId) {
                throw new Error("Unauthorized: You do not own this transaction");
                }

                if (transaction.status === "CANCELED") {
                throw new Error("This transaction has already been cancelled");
                }

                if (transaction.transactionType !== "PURCHASE") {
                throw new Error("Only PURCHASE transactions can be cancelled");
                }

                const hasFlights = transaction.tickets.length > 0;
                const hasHotels = transaction.reservations.length > 0;

                if (!hasFlights && !hasHotels) {
                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: "CANCELED" }
                });
                throw new Error("Transaction contains no flights or hotels");
                }

                // Hitung tanggal paling awal
                let earliestDate = null;

                transaction.tickets.forEach(ticket => {
                const date = ticket.flight?.departureTime;
                if (date && (!earliestDate || new Date(date) < earliestDate)) {
                    earliestDate = new Date(date);
                }
                });

                transaction.reservations.forEach(res => {
                if (!earliestDate || res.startDate < earliestDate) {
                    earliestDate = res.startDate;
                }
                });

                if (!earliestDate) {
                throw new Error("Earliest service date could not be determined");
                }

                const twoDaysFromNow = new Date();
                twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
                if (earliestDate < twoDaysFromNow) {
                throw new Error("Cancellation period has expired (less than 2 days left)");
                }

                // Hapus tiket dan reservasi
                if (hasFlights) {
                await tx.ticket.deleteMany({ where: { transactionId } });
                }

                if (hasHotels) {
                const reservationIds = transaction.reservations.map(r => r.id);
                if (reservationIds.length > 0) {
                    await tx.roomReservation.deleteMany({
                    where: { reservationId: { in: reservationIds } }
                    });
                    await tx.reservation.deleteMany({
                    where: { id: { in: reservationIds } }
                    });
                }
                }

                // Refund jika status PAID
                let refundData = null;

                if (transaction.status === "PAID") {
                await tx.user.update({
                    where: { id: userId },
                    data: { currentAmount: { increment: transaction.price } }
                });

                const partnerIds = new Set();

                // Flight partner
                const planeIds = [...new Set(transaction.tickets.map(t => t.flight?.planeId).filter(Boolean))];
                if (planeIds.length) {
                    const planes = await tx.plane.findMany({
                    where: { id: { in: planeIds } },
                    select: { airlineId: true }
                    });

                    const airlineIds = planes.map(p => p.airlineId);
                    const airlinePartners = await tx.airlinePartner.findMany({
                    where: { airlineId: { in: airlineIds } },
                    select: { partnerId: true }
                    });

                    airlinePartners.forEach(p => partnerIds.add(p.partnerId));
                }

                // Hotel partner
                transaction.reservations.forEach(res => {
                    res.roomReservations.forEach(rr => {
                    const hotelId = rr.room?.roomType?.hotel?.id;
                    if (hotelId) {
                        partnerIds.add(hotelId);
                    }
                    });
                });

                const hotelPartners = await tx.hotelPartner.findMany({
                    where: { hotelId: { in: Array.from(partnerIds) } },
                    select: { partnerId: true }
                });

                hotelPartners.forEach(p => partnerIds.add(p.partnerId));

                if (partnerIds.size === 0) {
                    throw new Error("No partners found to refund from");
                }

                const amountPerPartner = Math.floor(transaction.price / partnerIds.size);
                await Promise.all(Array.from(partnerIds).map(pid => {
                    return tx.user.update({
                    where: { id: pid },
                    data: { currentAmount: { decrement: amountPerPartner } }
                    });
                }));

                refundData = {
                    refundedAmount: transaction.price,
                    debitedPartners: Array.from(partnerIds),
                    amountPerPartner
                };
                }

                const updated = await tx.transaction.update({
                where: { id: transactionId },
                data: { status: "CANCELED" }
                });

                return {
                status: updated.status,
                refundData
                };
            });
        } catch (error) {
            throw new Error(error.message)
        }
    },
};