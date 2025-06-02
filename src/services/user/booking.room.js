import { isBefore, isAfter, addDays, differenceInDays } from "date-fns";
import prisma from "../../../prisma/prisma.client.js";

export default {
    async bookingRoomServices({ userId, roomId, startDate, endDate }) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();
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

            const rooms = await prisma.room.findMany({
            where: { id: { in: roomId } },
            include: { roomType: true },
            });

            if (rooms.length !== roomId.length) {
            throw new Error("Beberapa kamar tidak ditemukan");
            }

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

            const totalPrice = rooms.reduce((total, room) => {
            return total + room.roomType.price * days;
            }, 0);

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.currentAmount < totalPrice) {
            throw new Error("Saldo tidak mencukupi untuk booking semua kamar");
            }

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
            // Ambil transaksi + data yang dibutuhkan
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    user: true,
                    reservations: {
                    include: {
                        roomReservations: {
                        include: {
                            room: {
                            include: {
                                roomType: {
                                select: { price: true, typeName: true, hotelId: true },
                                },
                            },
                            },
                        },
                        },
                    },
                    },
                },
                });

                if (!transaction) throw new Error("Transaksi tidak ditemukan");
                if (transaction.userId !== userId) throw new Error("Akses ditolak");
                if (transaction.status === "PAID") throw new Error("Transaksi sudah dibayar");
                if (transaction.status === "CANCELED") throw new Error("Transaksi telah dibatalkan");
                if (!transaction.reservations?.length) throw new Error("Reservasi tidak ditemukan");

                const reservation = transaction.reservations[0];
                const now = Date.now();
                const createdAt = new Date(reservation.createdAt).getTime();
                const duration = Math.ceil(
                (new Date(reservation.endDate) - new Date(reservation.startDate)) /
                    (1000 * 60 * 60 * 24)
                );

                if (now - createdAt > 15 * 60 * 1000) {
                const reservationIds = transaction.reservations.map(r => r.id);
                await prisma.roomReservation.deleteMany({ where: { reservationId: { in: reservationIds } } });
                await prisma.reservation.deleteMany({ where: { id: { in: reservationIds } } });
                await prisma.transaction.update({
                    where: { id: transactionId },
                    data: { status: "CANCELED" },
                });
                throw new Error("Waktu pembayaran telah habis");
                }

                // Hitung pembagian ke mitra berdasarkan hotelId
                const mitraMap = new Map();

                for (const rr of reservation.roomReservations) {
                const { hotelId, price } = rr.room.roomType;
                const hotelPartner = await prisma.hotelPartner.findFirst({
                    where: { hotelId },
                    include: { partner: true },
                });

                if (!hotelPartner) continue;

                const totalHarga = price * duration * rr.amount;
                const mitraId = hotelPartner.partnerId;

                mitraMap.set(mitraId, (mitraMap.get(mitraId) || 0) + totalHarga);
                }

                // Validasi saldo
                if (transaction.user.currentAmount < transaction.price) {
                throw new Error("Saldo tidak mencukupi");
                }

                // Proses pembayaran dan pembagian ke mitra
                await prisma.$transaction(async tx => {
                for (const [mitraId, amount] of mitraMap.entries()) {
                    await tx.user.update({
                    where: { id: mitraId },
                    data: { currentAmount: { increment: amount } },
                    });
                }

                await tx.user.update({
                    where: { id: transaction.userId },
                    data: { currentAmount: { decrement: transaction.price } },
                });

                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: "PAID" },
                });
                });

                // Ambil data final untuk response
                return {
                message: "Pembayaran berhasil",
                transaction: {
                    id: transaction.id,
                    userId: transaction.user.id,
                    userName: transaction.user.name,
                    price: transaction.price,
                    status: "PAID",
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    rooms: reservation.roomReservations.map(rr => ({
                    id: rr.room.id,
                    name: rr.room.name,
                    typeName: rr.room.roomType.typeName,
                    })),
                },
            };
        } catch (error) {
            console.error("Gagal memproses pembayaran:", error.message);
            throw new Error(error.message);
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
                },
                hotelImages: {
                    select: {
                        id: true,
                        imageUrl: true
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

    async getRoomsByIdHotelService(hotelId) {
        try {
            const hotel = await prisma.hotel.findUnique({
                where: {
                    id: hotelId
                },
                select: {
                    name: true,
                    description: true,
                    hotelImages: {
                        select: {
                            imageUrl: true
                        }
                    },
                    roomTypes: {
                        select: {
                            typeName: true,
                            price: true,
                            rooms: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    roomReservations: {
                                        select: {
                                            id: true
                                        }
                                    },
                                    roomImages: {
                                        select: {
                                            urlImage: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!hotel) {
                throw new Error("Hotel not found");
            }

            const formattedRooms = hotel.roomTypes.flatMap(roomType =>
                roomType.rooms.map(room => ({
                    hotelName: hotel.name,
                    hotelDescription: hotel.description,
                    hotelImages: hotel.hotelImages.map(img => img.imageUrl),
                    roomId: room.id,
                    roomName: room.name,
                    roomDescription: room.description,
                    price: roomType.price,
                    status: room.roomReservations.length === 0 ? 'Available' : 'Not Available',
                    roomImages: room.roomImages.map(img => img.urlImage)
                }))
            );

            return formattedRooms;

        } catch (error) {
            console.error("Error fetching rooms by hotel:", error);
            throw new Error("Failed to fetch rooms");
        }
    },

    async detailRoomByIdRoomService(roomId) {
    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            },
            select: {
                name: true,
                description: true,
                roomImages: {
                    select: {
                        urlImage: true
                    }
                },
                roomType: {
                    select: {
                        typeName: true,
                        capacity: true,
                        price: true,
                        hotel: {
                            select: {
                                name: true // Ambil nama hotel
                            }
                        },
                        roomTypeFacilities: {
                            select: {
                                amount: true,
                                facility: {
                                    select: {
                                        facilityName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!room) {
            throw new Error("Room not found");
        }

        const formattedRoom = {
            roomId: roomId,
            roomName: room.name,
            hotelName: room.roomType.hotel.name,
            roomDescription: room.description,
            capacity: room.roomType.capacity,
            roomTypeName: room.roomType.typeName,
            roomPrice: room.roomType.price,
            roomImages: room.roomImages.map(img => img.urlImage),
            facilities: room.roomType.roomTypeFacilities.map(fac => ({
                name: fac.facility.facilityName,
                amount: fac.amount
            }))
        };

        return formattedRoom;

    } catch (error) {
        console.error("Error fetching room detail:", error);
        throw new Error("Failed to fetch room detail");
    }
},

    async mySaldoService(userId) {
        try {
            const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                currentAmount: true,
            },
            });

            if (!user) {
            throw new Error("User not found");
            }

            return user;
        } catch (error) {
            console.error("Error fetching user balance:", error);
            throw new Error(error.message || "Failed to fetch user balance");
        }
    },
};
