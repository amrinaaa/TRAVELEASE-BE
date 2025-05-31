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
                        price: true,
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
            roomName: room.name,
            roomDescription: room.description,
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

    async cancelRoomService(userId, transactionId) {
        try {
            return prisma.$transaction(async (tx) => {
                // 1. Ambil transaksi beserta reservasi dan detail hotel (untuk partner)
                const transaction = await tx.transaction.findUnique({
                    where: { id: transactionId },
                    include: {
                        user: { select: { id: true } },
                        reservations: { // Ini adalah array dari reservasi hotel
                            include: {
                                roomReservations: { // Setiap reservasi memiliki array roomReservations
                                    include: {
                                        room: {
                                            include: {
                                                roomType: {
                                                    include: {
                                                        hotel: { // Untuk mendapatkan hotelId
                                                            select: { id: true }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    },
                });

                if (!transaction) {
                    throw new Error('Transaction not found');
                }

                if (transaction.userId !== userId) {
                    throw new Error('User does not own this transaction');
                }

                if (transaction.status === 'CANCELED') {
                    throw new Error('Order already cancelled');
                }

                // Asumsi tipe transaksi 'PURCHASE' juga berlaku untuk hotel, atau sesuaikan jika ada tipe lain
                if (transaction.transactionType !== 'PURCHASE') {
                    throw new Error('Only purchase transactions can be cancelled for hotel reservations.');
                }

                if (!transaction.reservations || transaction.reservations.length === 0) {
                    await tx.transaction.update({
                        where: {id: transactionId},
                        data: {status: 'CANCELED', notes: "Cancelled due to no hotel reservations found."}
                    });
                    throw new Error('No hotel reservations found in this transaction. Order marked as cancelled.');
                }

                // 2. Tentukan tanggal check-in (startDate) paling awal dari semua reservasi hotel
                let earliestCheckInDate = null;
                for (const reservation of transaction.reservations) {
                    if (reservation.startDate) {
                        const checkIn = new Date(reservation.startDate);
                        if (!earliestCheckInDate || checkIn < earliestCheckInDate) {
                            earliestCheckInDate = checkIn;
                        }
                    }
                }

                if (!earliestCheckInDate) {
                    await tx.transaction.update({
                        where: {id: transactionId},
                        data: {status: 'CANCELED', notes: "Cancelled due to missing check-in dates."}
                    });
                    throw new Error('Could not determine check-in date for reservations in transaction. Order marked as cancelled.');
                }

                // 3. Cek aturan pembatalan (minimal 2 hari sebelum tanggal check-in)
                const currentTime = new Date();
                if ((earliestCheckInDate.getTime() - currentTime.getTime()) < 2 * 24 * 60 * 60 * 1000) {
                    throw new Error(`Cancellation window has passed. Must be at least 2 days before check-in (Earliest check-in: ${earliestCheckInDate.toISOString()})`);
                }

                // Kumpulkan ID semua reservasi dan roomReservation yang akan dihapus
                const reservationIdsToDelete = transaction.reservations.map(res => res.id);

                // 4. Logika berdasarkan status transaksi
                if (transaction.status === 'ORDERED') {
                    // Hapus semua RoomReservation yang terkait dengan reservasi dalam transaksi ini
                    if (reservationIdsToDelete.length > 0) {
                        await tx.roomReservation.deleteMany({
                            where: { reservationId: { in: reservationIdsToDelete } },
                        });
                        // Hapus semua Reservation yang terkait dengan transaksi ini
                        await tx.reservation.deleteMany({
                            where: { transactionId: transactionId }
                        });
                    }

                    // Update status transaksi menjadi CANCELED
                    const updatedTransaction = await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: 'CANCELED' },
                    });
                    return { status: updatedTransaction.status, message: "Hotel reservation cancelled. Reservation data deleted." };

                } else if (transaction.status === 'PAID') {
                    // Kembalikan saldo ke pengguna
                    await tx.user.update({
                        where: { id: userId },
                        data: { currentAmount: { increment: transaction.price } },
                    });

                    // Identifikasi Hotel dari reservasi/kamar pertama untuk menemukan partner yang akan didebit (ASUMSI PENYEDERHANAAN)
                    const firstReservation = transaction.reservations[0];
                    if (!firstReservation || !firstReservation.roomReservations || firstReservation.roomReservations.length === 0) {
                        throw new Error('Primary reservation or room information missing for partner debiting.');
                    }
                    const firstRoomReservation = firstReservation.roomReservations[0];
                    if (!firstRoomReservation.room || !firstRoomReservation.room.roomType || !firstRoomReservation.room.roomType.hotel || !firstRoomReservation.room.roomType.hotel.id) {
                        throw new Error('Primary hotel ID for debiting not found in reservation details.');
                    }
                    const hotelIdToDebit = firstRoomReservation.room.roomType.hotel.id;

                    // Cari mitra (User dengan peran MITRA_HOTEL) yang terkait dengan hotelIdToDebit
                    const hotelPartnerRecord = await tx.hotelPartner.findFirst({
                        where: { hotelId: hotelIdToDebit },
                        select: { partnerId: true } // partnerId adalah ID User si mitra
                    });

                    if (!hotelPartnerRecord || !hotelPartnerRecord.partnerId) {
                        throw new Error('Hotel partner not found for refund debiting.');
                    }
                    const partnerUserIdToDebit = hotelPartnerRecord.partnerId;

                    // Debit saldo dari User mitra
                    await tx.user.update({
                        where: { id: partnerUserIdToDebit },
                        data: { currentAmount: { decrement: transaction.price } },
                    });

                    // Hapus semua RoomReservation dan Reservation terkait
                    if (reservationIdsToDelete.length > 0) {
                        await tx.roomReservation.deleteMany({
                            where: { reservationId: { in: reservationIdsToDelete } },
                        });
                        await tx.reservation.deleteMany({
                            where: { transactionId: transactionId }
                        });
                    }

                    // Update status transaksi menjadi CANCELED
                    const updatedTransaction = await tx.transaction.update({
                        where: { id: transactionId },
                        data: { status: 'CANCELED' },
                    });

                    return {
                        status: updatedTransaction.status,
                        message: "Hotel reservation cancelled. User refunded. Partner debited. Reservation data deleted.",
                        refundedAmount: transaction.price,
                        debitedPartnerUserId: partnerUserIdToDebit
                    };

                } else {
                    throw new Error(`Invalid transaction status for cancellation: ${transaction.status}`);
                }
            });
        } catch (error) {
            throw new Error(error.message);
        }
    },
};
