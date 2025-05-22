import { isBefore, addDays, differenceInDays } from "date-fns";
import prisma from "../../../prisma/prisma.client.js";

export default {
    async bookingRoomServices({ userId, roomId, startDate, endDate }) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Step 1: Validasi tanggal maksimal 7 hari ke depan
        const maxDate = addDays(new Date(), 7);
        if (isBefore(maxDate, start)) {
        throw new Error("You can only booking up to 7 days in advance");
        }

        // Step 2: Ambil data kamar dan harga
        const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { roomType: true },
        });

        if (!room) {
        throw new Error("Room not found");
        }

        // Step 3: Hitung jumlah hari dan total harga
        const days = differenceInDays(end, start);
        if (days <= 0) {
        throw new Error("Minimum booking 1 day");
        }

        const totalPrice = room.roomType.price * days;

        // Step 4: Cek saldo user
        const user = await prisma.user.findUnique({
        where: { id: userId },
        });

        if (!user || user.currentAmount < totalPrice) {
        throw new Error("Saldo tidak mencukupi untuk booking");
        }

        // Step 5: Cek ketersediaan kamar
        const overlappingReservation = await prisma.roomReservation.findFirst({
        where: {
            roomId,
            reservation: {
            startDate: { lte: end },
            endDate: { gte: start },
            },
        },
        });

        if (overlappingReservation) {
        throw new Error("Kamar tidak tersedia di tanggal tersebut");
        }

        // Step 6: Buat transaksi dan reservasi
        const transaction = await prisma.transaction.create({
        data: {
            userId,
            price: totalPrice,
            status: "PAID",
            transactionType: "PURCHASE",
            reservations: {
            create: {
                startDate: start,
                endDate: end,
                roomReservations: {
                create: {
                    roomId,
                    amount: 1,
                },
                },
            },
            },
        },
        });

        // Step 7: Kurangi saldo user
        await prisma.user.update({
        where: { id: userId },
        data: {
            currentAmount: {
            decrement: totalPrice,
            },
        },
        });

        // Step 8: Return success
        return {
        message: "Booking room berhasil dilakukan",
        transactionId: transaction.id,
        };
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
