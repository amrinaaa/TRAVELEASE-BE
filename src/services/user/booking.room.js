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
