import { isBefore, isAfter, addDays, differenceInDays } from "date-fns";
import prisma from "../../../prisma/prisma.client.js";

export default {
    async bookingRoomServices({ userId, roomId, startDate, endDate }) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        // Step 1: Validasi tanggal booking (H+1 s.d. H+7)
        const minDate = addDays(today, 1);
        const maxDate = addDays(today, 7);

        if (isBefore(start, minDate)) {
        throw new Error("Booking hanya bisa dilakukan mulai dari H+1 (besok)");
        }

        if (isAfter(start, maxDate)) {
        throw new Error("Booking maksimal hanya bisa sampai H+7 dari hari ini");
        }

        const days = differenceInDays(end, start);
        if (days <= 0) {
        throw new Error("Minimum booking adalah 1 hari");
        }

        // Step 2: Ambil semua data room dan validasi
        const rooms = await prisma.room.findMany({
        where: { id: { in: roomId } },
        include: { roomType: true },
        });

        if (rooms.length !== roomId.length) {
        throw new Error("Beberapa kamar tidak ditemukan");
        }

        // Step 3: Cek apakah semua kamar tersedia di rentang tanggal
        for (const room of rooms) {
        const isBooked = await prisma.roomReservation.findFirst({
            where: {
            roomId: room.id,
            reservation: {
                startDate: { lte: end },
                endDate: { gte: start },
            },
            },
        });

        if (isBooked) {
            throw new Error(`Kamar '${room.name}' tidak tersedia di tanggal tersebut`);
        }
        }

        // Step 4: Hitung total harga
        const totalPrice = rooms.reduce((total, room) => {
        return total + room.roomType.price * days;
        }, 0);

        // Step 5: Cek saldo user
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.currentAmount < totalPrice) {
        throw new Error("Saldo tidak mencukupi untuk booking semua kamar");
        }

        // Step 6: Buat transaksi dan reservasi
        const transaction = await prisma.transaction.create({
        data: {
            userId,
            price: totalPrice,
            status: "ORDERED",
            transactionType: "PURCHASE",
            reservations: {
            create: {
                startDate: start,
                endDate: end,
                roomReservations: {
                create: rooms.map((room) => ({
                    roomId: room.id,
                    amount: 1,
                })),
                },
            },
            },
        },
        include: {
            reservations: {
            include: {
                roomReservations: {
                include: {
                    room: { include: { roomType: true } },
                },
                },
            },
            },
        },
        });

        // Step 7: Return data transaksi
        return {
        message: "Booking kamar berhasil",
        transaction: {
            id: transaction.id,
            userId: transaction.userId,
            price: transaction.price,
            status: transaction.status,
            startDate:
            transaction.reservations[0]?.startDate.toISOString().split("T")[0] || null,
            endDate:
            transaction.reservations[0]?.endDate.toISOString().split("T")[0] || null,
            rooms:
            transaction.reservations[0]?.roomReservations.map((rr) => ({
                id: rr.room.id,
                name: rr.room.name,
                typeName: rr.room.roomType.typeName,
            })) || [],
        },
        };
    } catch (error) {
        console.error("Error booking room:", error.message);
        throw error;
    }
    },

    async paymentBookingRoomServices({ userId, transactionId }) {
        try {
            // 1. Ambil data transaksi lengkap
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    reservations: {
                        include: {
                            roomReservations: {
                                include: {
                                    room: {
                                        include: {
                                            roomType: {
                                                include: {
                                                    hotel: {
                                                        include: {
                                                            hotelPartners: {
                                                                include: {
                                                                    partner: true,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    user: true,
                },
            });

            if (!transaction) {
                throw new Error("Transaksi tidak ditemukan");
            }

            if (transaction.status === "PAID") {
                throw new Error("Transaksi sudah dibayar");
            }

            if (transaction.status === "CANCELED") {
                throw new Error("Cannot pay for a canceled transaction");
            }

            if (!transaction.reservations || transaction.reservations.length === 0) {
                throw new Error("No reservations found for this transaction");
            }

            if (transaction.userId !== userId) {
                throw new Error("Kamu tidak memiliki akses ke transaksi ini");
            }

            const bookingTime = transaction.reservations[0].createdAt;

            if (Date.now() - bookingTime.getTime() > 15 * 60 * 1000) {
                // Ambil semua reservation ID
                const reservationIds = transaction.reservations.map(r => r.id);

                // Hapus RoomReservation dulu yang terkait reservation ini
                await prisma.roomReservation.deleteMany({
                    where: {
                        reservationId: {
                            in: reservationIds,
                        },
                    },
                });

                // Baru hapus reservation-nya
                await prisma.reservation.deleteMany({
                    where: {
                        id: {
                            in: reservationIds,
                        },
                    },
                });

                // Update status transaksi jadi CANCELED
                await prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        status: "CANCELED",
                    },
                });

                throw new Error("Waktu pembayaran telah habis");
            }

            const hotelId = transaction.reservations[0].roomReservations[0].room.roomType.hotelId;
            const hotelPartners = await prisma.hotelPartner.findFirst({
                where: {
                    hotelId: hotelId,
                },
                include: {
                    partner: true,
                },
            });

            if (!hotelPartners) {
                throw new Error("Hotel tidak memiliki mitra");
            }

            const user = transaction.user;

            if (user.currentAmount < transaction.price) {
                throw new Error("Saldo kamu tidak mencukupi untuk membayar transaksi ini");
            }

            // Hitung pembayaran untuk mitra
            const mitraMap = new Map();

            for (const roomReservation of transaction.reservations[0]?.roomReservations || []) {
                const hotelPartners = roomReservation.room.roomType.hotel.hotelPartners;

                if (hotelPartners.length === 0) continue;

                const mitra = hotelPartners[0].partner;

                const pricePerRoom = roomReservation.room.roomType.price;
                const duration = (new Date(transaction.reservations[0].endDate) - new Date(transaction.reservations[0].startDate)) / (1000 * 60 * 60 * 24);

                const total = pricePerRoom * duration;

                if (mitraMap.has(mitra.id)) {
                    mitraMap.set(mitra.id, mitraMap.get(mitra.id) + total);
                } else {
                    mitraMap.set(mitra.id, total);
                }
            }

            // Transaksi update data
            const result = await prisma.$transaction(async (tx) => {
                for (const [mitraId, amount] of mitraMap) {
                    await tx.user.update({
                        where: { id: mitraId },
                        data: {
                            currentAmount: {
                                increment: amount,
                            },
                        },
                    });
                }

                await tx.user.update({
                    where: { id: user.id },
                    data: {
                        currentAmount: {
                            decrement: transaction.price,
                        },
                    },
                });

                const updatedTransaction = await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: "PAID",
                    },
                });

                return updatedTransaction;
            });

            return {
                message: "Pembayaran berhasil",
                transaction: result,
            };
        } catch (error) {
            console.error("Error saat memproses pembayaran:", error);
            throw error;
        }
    },

    async hotelListServices(){
        try {
            const hotels = await prisma.hotel.findMany({
                select: {
                    id: true, 
                    name: true,
                    description: true,
                    address: true,
                    location: {
                        select: {
                            city: true
                        }
                    }
                }
            });

            return hotels;
        }
        catch (error) {
            console.error("Error fetching hotels:", error);
            throw new Error("Failed to fetch hotels");
        }
    },
};
