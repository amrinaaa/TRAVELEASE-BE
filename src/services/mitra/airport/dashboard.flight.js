import prisma from "../../../../prisma/prisma.client.js";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default {
    async bookingFlightTodayService() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Awal hari ini

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1); // Awal besok

            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7); // Awal hari yang sama minggu lalu

            const nextDayLastWeek = new Date(lastWeek);
            nextDayLastWeek.setDate(lastWeek.getDate() + 1); // Besok dari hari minggu lalu

            // Jumlah booking yang dibuat hari ini
            const bookingToday = await prisma.ticket.count({
                where: {
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            });

            // Jumlah booking yang dibuat pada hari yang sama minggu lalu
            const bookingLastWeek = await prisma.ticket.count({
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
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async revenueTodayService() {
        try {
            const today = new Date();

            // Awal dan akhir hari ini
            const startToday = startOfDay(today);
            const endToday = endOfDay(today);

            // Awal dan akhir hari yang sama minggu lalu
            const startLastWeek = startOfDay(subDays(today, 7));
            const endLastWeek = endOfDay(subDays(today, 7));

            // Ambil reservation yang DIBUAT hari ini
            const bookingsToday = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: startToday,
                        lte: endToday,
                    },
                },
                include: { transaction: true },
            });

            // Ambil reservation yang DIBUAT pada hari yang sama minggu lalu
            const bookingsLastWeek = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: startLastWeek,
                        lte: endLastWeek,
                    },
                },
                include: { transaction: true },
            });

            // Total revenue hari ini dan minggu lalu
            const revenueToday = bookingsToday.reduce(
                (sum, res) => sum + (res.transaction?.price ?? 0),
                0
            );
            const revenueLastWeek = bookingsLastWeek.reduce(
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
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async grahpRevenueMonthlyService() {
        try {
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = [];
    
            for (let month = 0; month < 12; month++) {
                const start = startOfMonth(new Date(currentYear, month));
                const end = endOfMonth(new Date(currentYear, month));
    
                const bookings = await prisma.ticket.findMany({
                    where: {
                        createdAt: {
                            gte: start,
                            lte: end,
                        },
                    },
                    include: { transaction: true },
                });
    
                const total = bookings.reduce(
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
            throw new Error(error.message);
        }
    },

    async grahpBookingMonthlyService() {
        try {
            const currentYear = new Date().getFullYear();
            const monthlyBooking = [];

            for (let month = 0; month < 12; month++) {
                const start = startOfMonth(new Date(currentYear, month));
                const end = endOfMonth(new Date(currentYear, month));

                const booking = await prisma.ticket.findMany({
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
                totalBooking: booking.length,
                });
            }

            return monthlyBooking;
        } catch (error) {
            throw new Error(error.message);
        };
    },
};