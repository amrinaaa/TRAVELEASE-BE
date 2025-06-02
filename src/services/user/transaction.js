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
            // 1. Ambil transaksi
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    reservations: {
                        include: {
                        roomReservations: true,
                        },
                    },
                    tickets: {
                        include: {
                            flight: true, // ✅ tambahkan ini untuk akses flight.price
                        },
                    },
                },
            });

            if (!transaction) {
                throw new Error("Transaction not found");
            }

            if (transaction.userId !== userId) {
                throw new Error("User does not own this transaction");
            }

            if (transaction.status === "CANCELED") {
                throw new Error("Transaction already canceled");
            }

            let totalRefund = 0;
            const partnerMap = new Map(); // partnerId => total amount to deduct

            // 2. Hitung refund dari tiket pesawat
            for (const ticket of transaction.tickets) {
                totalRefund += ticket.flight.price;

                const seat = await prisma.seat.findUnique({
                where: { id: ticket.seatId },
                include: {
                    seatCategory: {
                    include: {
                        plane: {
                        include: {
                            airline: {
                            include: {
                                airlinePartners: true,
                            },
                            },
                        },
                        },
                    },
                    },
                },
                });

                const airlinePartners = seat?.seatCategory?.plane?.airline?.airlinePartners || [];
                const amount = ticket.flight.price;

                for (const partner of airlinePartners) {
                const current = partnerMap.get(partner.partnerId) || 0;
                partnerMap.set(partner.partnerId, current + Math.floor(amount / airlinePartners.length));
                }
            }

            // 3. Hitung refund dari reservasi hotel
            for (const reservation of transaction.reservations) {
                for (const roomReservation of reservation.roomReservations) {
                const room = await prisma.room.findUnique({
                    where: { id: roomReservation.roomId },
                    include: {
                    roomType: {
                        include: {
                        hotel: {
                            include: {
                            hotelPartners: true,
                            },
                        },
                        },
                    },
                    },
                });

                const price = room.roomType.price * roomReservation.amount;
                totalRefund += price;

                const hotelPartners = room?.roomType?.hotel?.hotelPartners || [];

                for (const partner of hotelPartners) {
                    const current = partnerMap.get(partner.partnerId) || 0;
                    partnerMap.set(partner.partnerId, current + Math.floor(price / hotelPartners.length));
                }
                }
            }

            // 4. Update status transaksi
            await prisma.transaction.update({
                where: { id: transactionId },
                data: { status: "CANCELED" },
            });

            // 5. Refund ke user
            await prisma.user.update({
                where: { id: userId },
                data: {
                currentAmount: {
                    increment: totalRefund,
                },
                },
            });

            // 6. Kurangi saldo setiap mitra
            const refundDetails = [];

            for (const [partnerId, amount] of partnerMap.entries()) {
                await prisma.user.update({
                where: { id: partnerId },
                data: {
                    currentAmount: {
                    decrement: amount,
                    },
                },
                });

                refundDetails.push({
                partnerId,
                deductedAmount: amount,
                });
            }

            // 7. Response
            return {
                message: "Transaction canceled successfully",
                totalRefund,
                refundedToUser: userId,
                partnerDeductions: refundDetails,
                transactionId: transaction.id,
                status: "CANCELED",
            };
        } catch (error) {
            throw new Error(error.message)
        }
    },
};