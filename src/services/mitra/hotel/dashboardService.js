import prisma from "../../../../prisma/prisma.client.js";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';


export default {
    async newBookingTodayService() {
        try{
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);

            const nextDayLastWeek = new Date(lastWeek);
            nextDayLastWeek.setDate(lastWeek.getDate() + 1);

            const bookingToday = await prisma.reservation.count({
                where: {
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            });

            const bookingLastWeek = await prisma.reservation.count({
                where: {
                    createdAt: {
                        gte: lastWeek,
                        lt: nextDayLastWeek,
                    },
                },
            });

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
            } catch (error) {
            console.error('Error in newBookingTodayService:', error);
            throw new Error('Gagal mengambil data booking hari ini');
        }
    },

    async availableRoomService() {
        try {
            const today = new Date();
            const startToday = startOfDay(today);
            const endToday = endOfDay(today);

            const lastWeek = subDays(today, 7);
            const startLastWeek = startOfDay(lastWeek);
            const endLastWeek = endOfDay(lastWeek);

            const totalRooms = await prisma.room.count();

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
            } catch (error) {
            console.error('Error in availableRoomService:', error);
            throw new Error('Gagal mengambil data available room hari ini');
        }
    },

    async activeBookingRoomService() {
        try{
            const today = new Date();
            const startToday = startOfDay(today);
            const endToday = endOfDay(today);

            const lastWeek = subDays(today, 7);
            const startLastWeek = startOfDay(lastWeek);
            const endLastWeek = endOfDay(lastWeek);

            const activeToday = await prisma.reservation.count({
                where: {
                startDate: { lte: endToday },
                endDate: { gte: startToday },
                },
            });

            const activeLastWeek = await prisma.reservation.count({
                where: {
                startDate: { lte: endLastWeek },
                endDate: { gte: startLastWeek },
                },
            });

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
        } catch (error) {
            console.error('Error in activeBookingRoomService:', error);
            throw new Error('Gagal mengambil data booking aktif');
        }
    },

    async revenueReportService() {
        try {
            const today = new Date();
            const startToday = startOfDay(today);
            const endToday = endOfDay(today);

            const startLastWeek = startOfDay(subDays(today, 7));
            const endLastWeek = endOfDay(subDays(today, 7));

            const reservationsToday = await prisma.reservation.findMany({
                where: {
                    createdAt: {
                        gte: startToday,
                        lte: endToday,
                    },
                },
                include: { transaction: true },
            });

            const reservationsLastWeek = await prisma.reservation.findMany({
                where: {
                    createdAt: {
                        gte: startLastWeek,
                        lte: endLastWeek,
                    },
                },
                include: { transaction: true },
            });

            const revenueToday = reservationsToday.reduce(
                (sum, res) => sum + (res.transaction?.price ?? 0),
                0
            );
            const revenueLastWeek = reservationsLastWeek.reduce(
                (sum, res) => sum + (res.transaction?.price ?? 0),
                0
            );

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
        } catch (error) {
            console.error('Error in revenueReportService:', error);
            throw new Error('Gagal mengambil data revenue');
        }
    },

    async grafikRevenueServices() {
        try {
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
        } catch (error) {
            console.error('Error in grafikRevenueServices:', error);
            throw new Error('Gagal mengambil data grafik revenue');
        }
    },

    async grafikBookingServices() {
        try {
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
        } catch (error) {
            console.error('Error in grafikBookingServices:', error);
            throw new Error('Gagal mengambil data grafik booking');
        }
    },
}