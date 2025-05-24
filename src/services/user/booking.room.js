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
            user: true,
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
                    },
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
            hotel: transaction.reservations[0]?.roomReservations[0]?.room.roomType.hotel.name || null,
            userId: transaction.userId,
            userName: transaction.user.name,
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

        if (!transaction) throw new Error("Transaksi tidak ditemukan");
        if (transaction.userId !== userId) throw new Error("Kamu tidak memiliki akses ke transaksi ini");
        if (transaction.status === "PAID") throw new Error("Transaksi sudah dibayar");
        if (transaction.status === "CANCELED") throw new Error("Transaksi telah dibatalkan");
        if (!transaction.reservations?.length) throw new Error("Reservasi tidak ditemukan dalam transaksi ini");

        const reservation = transaction.reservations[0];
        const now = Date.now();
        const bookingTime = new Date(reservation.createdAt).getTime();

        if (now - bookingTime > 15 * 60 * 1000) {
            const reservationIds = transaction.reservations.map(r => r.id);
            await prisma.roomReservation.deleteMany({ where: { reservationId: { in: reservationIds } } });
            await prisma.reservation.deleteMany({ where: { id: { in: reservationIds } } });
            await prisma.transaction.update({
                where: { id: transactionId },
                data: { status: "CANCELED" },
            });

            throw new Error("Waktu pembayaran telah habis");
        }

        const user = transaction.user;
        if (user.currentAmount < transaction.price) {
            throw new Error("Saldo kamu tidak mencukupi untuk membayar transaksi ini");
        }

        const mitraMap = new Map();
        for (const roomReservation of reservation.roomReservations) {
            const hotelPartner = roomReservation.room.roomType.hotel.hotelPartners[0];
            if (!hotelPartner) continue;

            const mitra = hotelPartner.partner;
            const pricePerRoom = roomReservation.room.roomType.price;
            const duration = (new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24);
            const total = pricePerRoom * duration;

            mitraMap.set(mitra.id, (mitraMap.get(mitra.id) || 0) + total);
        }

        await prisma.$transaction(async (tx) => {
            for (const [mitraId, amount] of mitraMap.entries()) {
                await tx.user.update({
                    where: { id: mitraId },
                    data: {
                        currentAmount: { increment: amount },
                    },
                });
            }

            await tx.user.update({
                where: { id: user.id },
                data: {
                    currentAmount: { decrement: transaction.price },
                },
            });

            await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: "PAID" },
            });
        });

        // Ambil ulang data untuk respons
        const finalTransaction = await prisma.transaction.findUnique({
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
                                                hotel: true,
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

        return {
            message: "Pembayaran berhasil",
            transaction: {
                id: finalTransaction.id,
                hotel: finalTransaction.reservations[0]?.roomReservations[0]?.room?.roomType?.hotel?.name || "Unknown Hotel",
                userId: finalTransaction.user.id,
                userName: finalTransaction.user.username,
                price: finalTransaction.price,
                status: finalTransaction.status,
                startDate: finalTransaction.reservations[0].startDate,
                endDate: finalTransaction.reservations[0].endDate,
                rooms: finalTransaction.reservations[0]?.roomReservations.map(rr => ({
                    id: rr.room.id,
                    name: rr.room.name,
                    typeName: rr.room.roomType.typeName,
                })),
            },
        };

    } catch (error) {
        console.error("Error saat memproses pembayaran:", error);
        throw error;
    }
},

    async getHotelService() {
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
    
            } catch (error) {
                    console.error("Error fetching hotels:", error);
                    throw new Error("Failed to fetch hotels");
                }
            },
};
