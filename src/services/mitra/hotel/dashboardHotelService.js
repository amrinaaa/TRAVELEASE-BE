import prisma from "../../../../prisma/prisma.client.js";
import { startOfDay, endOfDay, subDays } from 'date-fns';


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
        const totalToday = await prisma.reservation.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Jumlah booking yang dibuat pada hari yang sama minggu lalu
        const totalLastWeek = await prisma.reservation.count({
            where: {
                createdAt: {
                    gte: lastWeek,
                    lt: nextDayLastWeek,
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
            percentage: (percentageChange >= 0 ? '+ ' : '- ') + Math.abs(percentageChange).toFixed(2) + '%',
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
            percentage: (percentageChange >= 0 ? '+ ' : '- ') + Math.abs(percentageChange).toFixed(2) + '%',
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

        // Hari ini: mulai dan akhir hari
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Hari yang sama minggu lalu
        const dayLastWeek = subDays(today, 1);
        const startLastWeek = startOfDay(dayLastWeek);
        const endLastWeek = endOfDay(dayLastWeek);

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

        // Ambil reservation + transaction hari yang sama minggu lalu
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

        // Hitung persentase perubahan
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