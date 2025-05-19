import prisma from "../../../../prisma/prisma.client.js";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, subDays } from 'date-fns';


export default {
    async newBookingTodayService() {
        const today = new Date();
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Ambil minggu penuh minggu lalu (Senin–Minggu)
        const lastWeek = subWeeks(today, 1);
        const startLastWeek = startOfWeek(lastWeek, { weekStartsOn: 1 });
        const endLastWeek = endOfWeek(lastWeek, { weekStartsOn: 1 });

        // Jumlah booking yang dibuat hari ini
        const totalToday = await prisma.reservation.count({
            where: {
                createdAt: {
                    gte: startToday,
                    lte: endToday,
                },
            },
        });

        // Jumlah booking yang dibuat selama minggu lalu penuh
        const totalLastWeek = await prisma.reservation.count({
            where: {
                createdAt: {
                    gte: startLastWeek,
                    lte: endLastWeek,
                },
            },
        });

        // Hitung perubahan persentase
        let percentageChange = 0;

        if (totalLastWeek > 0) {
            percentageChange = ((totalToday - totalLastWeek) / totalLastWeek) * 100;
        } else if (totalToday > 0) {
            percentageChange = 100;
        }

        return {
            totalToday,
            totalLastWeek,
            percentage: (percentageChange >= 0 ? '+ ' : '- ') + Math.abs(percentageChange).toFixed(2) + '%',
        };
    },

    async availableRoomService() {
        const today = new Date();
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Minggu lalu (Senin–Minggu penuh)
        const lastWeek = subWeeks(today, 1);
        const startLastWeek = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Senin minggu lalu
        const endLastWeek = endOfWeek(lastWeek, { weekStartsOn: 1 });     // Minggu minggu lalu

        const totalRooms = await prisma.room.count();

        // Room dibooking hari ini (overlap tanggal hari ini)
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

        // Room dibooking selama minggu penuh minggu lalu
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
            percentage: (percentageChange >= 0 ? '+ ' : '- ') + Math.abs(percentageChange).toFixed(2) + '%',
        };
    },

    async activeBookingRoomService() {
        const today = new Date();

        // Hari ini
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Minggu lalu (Senin–Minggu penuh minggu lalu)
        const lastWeekDate = subWeeks(today, 1); // ambil 1 minggu sebelumnya dari hari ini
        const startLastWeek = startOfWeek(lastWeekDate, { weekStartsOn: 1 }); // Senin
        const endLastWeek = endOfWeek(lastWeekDate, { weekStartsOn: 1 });     // Minggu

        // Booking aktif hari ini
        const activeToday = await prisma.reservation.count({
            where: {
                startDate: { lte: endToday },
                endDate: { gte: startToday },
            },
        });

        // Booking aktif minggu lalu (minggu penuh)
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

        // Hari ini
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Minggu lalu (Senin sampai Minggu)
        const lastWeek = subWeeks(today, 1); // Ambil tanggal minggu lalu dari hari ini
        const startLastWeek = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Senin minggu lalu
        const endLastWeek = endOfWeek(lastWeek, { weekStartsOn: 1 });     // Minggu minggu lalu

        // Ambil reservation + transaction hari ini
        const reservationsToday = await prisma.reservation.findMany({
            where: {
            startDate: {
                gte: startToday,
                lte: endToday,
            },
            },
            include: { transaction: true },
        });

        // Ambil reservation + transaction untuk minggu lalu (Senin–Minggu)
        const reservationsLastWeek = await prisma.reservation.findMany({
            where: {
            startDate: {
                gte: startLastWeek,
                lte: endLastWeek,
            },
            },
            include: { transaction: true },
        });

        // Hitung total
        const totalToday = reservationsToday.reduce(
            (sum, res) => sum + (res.transaction?.price ?? 0),
            0
        );
        const totalLastWeek = reservationsLastWeek.reduce(
            (sum, res) => sum + (res.transaction?.price ?? 0),
            0
        );

        // Hitung persentase
        let percentageChange = 0;
        if (totalLastWeek === 0 && totalToday > 0) {
            percentageChange = 100;
        } else if (totalLastWeek === 0 && totalToday === 0) {
            percentageChange = 0;
        } else {
            percentageChange = ((totalToday - totalLastWeek) / totalLastWeek) * 100;
        }

        const percentageStatus =
            percentageChange > 0
            ? `+ ${percentageChange.toFixed(2)}%`
            : percentageChange < 0
            ? `- ${Math.abs(percentageChange).toFixed(2)}%`
            : '';

        return {
            revenueToday: totalToday,
            revenueLastWeek: totalLastWeek,
            percentage: percentageStatus,
        };
    }
}