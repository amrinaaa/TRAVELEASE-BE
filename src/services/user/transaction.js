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
};