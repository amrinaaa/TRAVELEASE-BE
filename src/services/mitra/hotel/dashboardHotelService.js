import prisma from "../../../../prisma/prisma.client.js";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';


export default {
    async newBookingTodayService() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Awal hari ini

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Awal besok

        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7); // Awal hari yang sama minggu lalu

        const nextDayLastWeek = new Date(lastWeek);
        nextDayLastWeek.setDate(lastWeek.getDate() + 1); // Besok dari hari minggu lalu

        // Jumlah booking yang dibuat hari ini
        const bookingToday = await prisma.reservation.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Jumlah booking yang dibuat pada hari yang sama minggu lalu
        const bookingLastWeek = await prisma.reservation.count({
            where: {
                createdAt: {
                    gte: lastWeek,
                    lt: nextDayLastWeek,
                },
            },
        });

        // Hitung perubahan persentase
        let percentageChange = 0;

        if (bookingLastWeek > 0) {
            percentageChange = ((bookingToday - bookingLastWeek) / bookingLastWeek) * 100;
        } else if (bookingToday > 0) {
            percentageChange = 100;
        }

        return {
            bookingToday,
            bookingLastWeek,
            percentageChange: (percentageChange >= 0 ? '+ ' : '- ') + Math.abs(percentageChange).toFixed(2) + '%',
        };
    },

    async availableRoomService() {
        const today = new Date();
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        const lastWeek = subDays(today, 7);
        const startLastWeek = startOfDay(lastWeek);
        const endLastWeek = endOfDay(lastWeek);

        const totalRooms = await prisma.room.count();

        // Cari room yang dibooking hari ini (overlap tanggal hari ini)
        const bookedToday = await prisma.roomReservation.findMany({
            where: {
            reservation: {
                AND: [
                { startDate: { lte: endToday } },
                { endDate: { gte: startToday } }
                ]
            }
            },
            select: { roomId: true },
        });

        const bookedTodayIds = [...new Set(bookedToday.map(r => r.roomId))];
        const availableToday = totalRooms - bookedTodayIds.length;

        // Cari room yang dibooking hari yang sama minggu lalu
        const bookedLastWeek = await prisma.roomReservation.findMany({
            where: {
            reservation: {
                AND: [
                { startDate: { lte: endLastWeek } },
                { endDate: { gte: startLastWeek } }
                ]
            }
            },
            select: { roomId: true },
        });

        const bookedLastWeekIds = [...new Set(bookedLastWeek.map(r => r.roomId))];
        const availableLastWeek = totalRooms - bookedLastWeekIds.length;

        let percentageChange = 0;

        if (availableLastWeek > 0) {
            percentageChange = ((availableToday - availableLastWeek) / availableLastWeek) * 100;
        } else if (availableToday > 0) {
            percentageChange = 100;
        }

        return {
            availableRoomToday: availableToday,
            availableRoomLastWeek: availableLastWeek,
            percentageChange: (percentageChange >= 0 ? '+ ' : '- ') + Math.abs(percentageChange).toFixed(2) + '%',
        };
    },

    async activeBookingRoomService() {
        const today = new Date();
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        const lastWeek = subDays(today, 7);
        const startLastWeek = startOfDay(lastWeek);
        const endLastWeek = endOfDay(lastWeek);

        // Booking aktif hari ini
        const activeToday = await prisma.reservation.count({
            where: {
            startDate: { lte: endToday },
            endDate: { gte: startToday },
            },
        });

        // Booking aktif minggu lalu (hari yang sama)
        const activeLastWeek = await prisma.reservation.count({
            where: {
            startDate: { lte: endLastWeek },
            endDate: { gte: startLastWeek },
            },
        });

        // Hitung persentase perubahan
        let percentageChange = 0;
        if (activeLastWeek === 0 && activeToday > 0) {
            percentageChange = 100;
        } else if (activeLastWeek === 0 && activeToday === 0) {
            percentageChange = 0;
        } else {
            percentageChange = ((activeToday - activeLastWeek) / activeLastWeek) * 100;
        }

        const status =
            percentageChange >= 0
            ? `+ ${percentageChange.toFixed(2)}%`
            : `- ${Math.abs(percentageChange).toFixed(2)}%`;

        return {
            activeToday,
            activeLastWeek,
            percentageChange: status,
        };
    },

    async revenueReportService() {
        const today = new Date();

        // Awal dan akhir hari ini
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Awal dan akhir hari yang sama minggu lalu
        const startLastWeek = startOfDay(subDays(today, 7));
        const endLastWeek = endOfDay(subDays(today, 7));

        // Ambil reservation yang DIBUAT hari ini
        const reservationsToday = await prisma.reservation.findMany({
            where: {
                createdAt: {
                    gte: startToday,
                    lte: endToday,
                },
            },
            include: { transaction: true },
        });

        // Ambil reservation yang DIBUAT pada hari yang sama minggu lalu
        const reservationsLastWeek = await prisma.reservation.findMany({
            where: {
                createdAt: {
                    gte: startLastWeek,
                    lte: endLastWeek,
                },
            },
            include: { transaction: true },
        });

        // Total revenue hari ini dan minggu lalu
        const revenueToday = reservationsToday.reduce(
            (sum, res) => sum + (res.transaction?.price ?? 0),
            0
        );
        const revenueLastWeek = reservationsLastWeek.reduce(
            (sum, res) => sum + (res.transaction?.price ?? 0),
            0
        );

        // Hitung perubahan persentase
        let percentageChange = 0;
        if (revenueLastWeek === 0 && revenueToday > 0) {
            percentageChange = 100;
        } else if (revenueLastWeek === 0 && revenueToday === 0) {
            percentageChange = 0;
        } else {
            percentageChange = ((revenueToday - revenueLastWeek) / revenueLastWeek) * 100;
        }

        const percentageStatus =
            percentageChange > 0
                ? `+ ${percentageChange.toFixed(2)}%`
                : percentageChange < 0
                ? `- ${Math.abs(percentageChange).toFixed(2)}%`
                : '0%';

        return {
            revenueToday,
            revenueLastWeek,
            percentageChange: percentageStatus,
        };
    },

    async grafikRevenueServices() {
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = [];

        for (let month = 0; month < 12; month++) {
            const start = startOfMonth(new Date(currentYear, month));
            const end = endOfMonth(new Date(currentYear, month));

            const reservations = await prisma.reservation.findMany({
                where: {
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                },
                include: { transaction: true },
            });

            const total = reservations.reduce(
                (sum, res) => sum + (res.transaction?.price ?? 0),
                0
            );

            monthlyRevenue.push({
                month: new Date(currentYear, month).toLocaleString('default', { month: 'long' }),
                totalRevenue: total,
            });
        }

        return monthlyRevenue;
    },

    async grafikBookingServices() {
        const currentYear = new Date().getFullYear();
        const monthlyBooking = [];

        for (let month = 0; month < 12; month++) {
            const start = startOfMonth(new Date(currentYear, month));
            const end = endOfMonth(new Date(currentYear, month));

            const reservations = await prisma.reservation.findMany({
            where: {
                createdAt: {
                gte: start,
                lte: end,
                },
                transactionId: {
                not: "",
                },
            },
            include: {
                transaction: true,
            },
            });

            monthlyBooking.push({
            month: new Date(currentYear, month).toLocaleString('default', { month: 'long' }),
            totalBooking: reservations.length,
            });
        }

        return monthlyBooking;
    }
}