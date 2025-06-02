import prisma from "../../../../prisma/prisma.client.js";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default {
    async bookingFlightTodayService(partnerId) {
        try {
            const partnerAirlines = await prisma.airlinePartner.findMany({
                where: { partnerId: partnerId },
                select: { airlineId: true }
            });

            if (partnerAirlines.length === 0) {
                throw new Error('No airlines found for this partner');
            }

            // Extract airline IDs
            const airlineIds = partnerAirlines.map(pa => pa.airlineId);

            // Set up date ranges
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Awal hari ini
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1); // Awal besok
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7); // Awal hari yang sama minggu lalu
            const nextDayLastWeek = new Date(lastWeek);
            nextDayLastWeek.setDate(lastWeek.getDate() + 1); // Besok dari hari minggu lalu

            // Count bookings for partner's airlines today
            const bookingToday = await prisma.ticket.count({
                where: {
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                    flight: {
                        plane: {
                            airline: {
                                id: { in: airlineIds }
                            }
                        }
                    }
                },
            });

            // Count bookings for partner's airlines last week (same day)
            const bookingLastWeek = await prisma.ticket.count({
                where: {
                    createdAt: {
                        gte: lastWeek,
                        lt: nextDayLastWeek,
                    },
                    flight: {
                        plane: {
                            airline: {
                                id: { in: airlineIds }
                            }
                        }
                    }
                },
            });

            // Calculate percentage change
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

    async avalaibleAirplaneService(partnerId) {
        try {
            // Validasi partner
            const partner = await prisma.user.findUnique({
                where: { id: partnerId },
                select: { id: true, name: true, role: true }
            });

            if (!partner) throw new Error('Partner not found');

            // Hitung total pesawat dari semua airline partner
            const partnerAirlines = await prisma.airlinePartner.findMany({
                where: { partnerId },
                select: { airline: { select: { _count: { select: { planes: true } } } } }
            });

            // Jumlahkan total pesawat
            const totalPlanes = partnerAirlines.reduce(
                (sum, airline) => sum + airline.airline._count.planes,
                0
            );

            return {
                partnerId: partner.id,
                partnerName: partner.name,
                totalPlanes
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async revenueTodayService(partnerId) {
        try {
            const partnerAirlines = await prisma.airlinePartner.findMany({
                where: { partnerId: partnerId },
                select: { airlineId: true }
            });

            if (partnerAirlines.length === 0) {
                throw new Error('No airlines found for this partner');
            }

            // Extract airline IDs
            const airlineIds = partnerAirlines.map(pa => pa.airlineId);

            // Set up date ranges
            const today = new Date();

            today.setHours(0, 0, 0, 0); // Start of today
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1); // Start of tomorrow
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7); // Start of same day last week
            const nextDayLastWeek = new Date(lastWeek);
            nextDayLastWeek.setDate(lastWeek.getDate() + 1); // Next day from last week

            // Get tickets created today for partner's airlines
            const bookingsToday = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                    flight: {
                        plane: {
                            airline: {
                                id: { in: airlineIds }
                            }
                        }
                    }
                },
                include: { 
                    transaction: true,
                    flight: {
                        include: {
                            plane: {
                                include: {
                                    airline: true
                                }
                            }
                        }
                    }
                },
            });

            // Get tickets created on same day last week for partner's airlines
            const bookingsLastWeek = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: lastWeek,
                        lt: nextDayLastWeek,
                    },
                    flight: {
                        plane: {
                            airline: {
                                id: { in: airlineIds }
                            }
                        }
                    }
                },
                include: { 
                    transaction: true,
                    flight: {
                        include: {
                            plane: {
                                include: {
                                    airline: true
                                }
                            }
                        }
                    }
                },
            });

            // Calculate revenue today and last week
            const revenueToday = bookingsToday.reduce(
                (sum, ticket) => {
                    // Only count tickets from paid transactions
                    if (ticket.transaction?.status === 'PAID') {
                        // Calculate proportional revenue per ticket
                        const transactionPrice = ticket.transaction.price || 0;
                        const ticketsInTransaction = bookingsToday.filter(t => t.transactionId === ticket.transactionId).length;
                        return sum + (transactionPrice / ticketsInTransaction);
                    }
                    return sum;
                },
                0
            );

            const revenueLastWeek = bookingsLastWeek.reduce(
                (sum, ticket) => {
                    // Only count tickets from paid transactions
                    if (ticket.transaction?.status === 'PAID') {
                        // Calculate proportional revenue per ticket
                        const transactionPrice = ticket.transaction.price || 0;
                        const ticketsInTransaction = bookingsLastWeek.filter(t => t.transactionId === ticket.transactionId).length;
                        return sum + (transactionPrice / ticketsInTransaction);
                    }
                    return sum;
                },
                0
            );

            // Calculate percentage change
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
                revenueToday: Math.round(revenueToday),
                revenueLastWeek: Math.round(revenueLastWeek),
                percentageChange: percentageStatus,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async grahpRevenueMonthlyService(partnerId) {
        try {
            const partnerAirlines = await prisma.airlinePartner.findMany({
                where: { partnerId },
                select: { airlineId: true }
            });

            if (partnerAirlines.length === 0) {
                throw new Error('No airlines found for this partner');
            }

            const airlineIds = partnerAirlines.map(pa => pa.airlineId);
            const currentYear = new Date().getFullYear();

            // Ambil semua tiket selama tahun ini untuk airline partner
            const allTickets = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: new Date(currentYear, 0, 1),
                        lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
                    },
                    flight: {
                        plane: {
                            airlineId: { in: airlineIds }
                        }
                    },
                },
                include: {
                    transaction: true
                }
            });

            // Kelompokkan berdasarkan bulan
            const monthlyRevenueMap = Array(12).fill(0);

            // Cache jumlah tiket per transaksi agar tidak dihitung berulang
            const ticketsPerTransaction = {};

            for (const ticket of allTickets) {
                const transaction = ticket.transaction;
                if (!transaction || transaction.status !== 'PAID') continue;

                const month = new Date(ticket.createdAt).getMonth();
                const transactionId = ticket.transactionId;

                // Hitung jumlah tiket dalam transaksi (cache)
                if (!ticketsPerTransaction[transactionId]) {
                    ticketsPerTransaction[transactionId] = allTickets.filter(t => t.transactionId === transactionId).length;
                }

                const ticketShare = (transaction.price || 0) / ticketsPerTransaction[transactionId];
                monthlyRevenueMap[month] += ticketShare;
            }

            const monthlyRevenue = monthlyRevenueMap.map((total, index) => ({
                month: new Date(currentYear, index).toLocaleString('default', { month: 'long' }),
                totalRevenue: Math.round(total)
            }));

            return monthlyRevenue;
        } catch (error) {
            console.error('Error in grahpRevenueMonthlyService:', error.message);
            throw new Error(`Failed to get monthly revenue data: ${error.message}`);
        }
    },

    async grahpBookingMonthlyService(partnerId) {
        try {
            const partnerAirlines = await prisma.airlinePartner.findMany({
                where: { partnerId },
                select: { airlineId: true }
            });

            if (partnerAirlines.length === 0) {
                throw new Error('No airlines found for this partner');
            }

            const airlineIds = partnerAirlines.map(pa => pa.airlineId);
            const currentYear = new Date().getFullYear();

            // Ambil semua tiket selama tahun ini untuk airline partner
            const allBookings = await prisma.ticket.findMany({
                where: {
                    createdAt: {
                        gte: new Date(currentYear, 0, 1),
                        lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
                    },
                    flight: {
                        plane: {
                            airlineId: { in: airlineIds }
                        }
                    },
                    transactionId: { not: "" }
                },
                select: {
                    createdAt: true
                }
            });

            // Inisialisasi array 12 bulan
            const monthlyBookingMap = Array(12).fill(0);

            for (const booking of allBookings) {
                const month = new Date(booking.createdAt).getMonth();
                monthlyBookingMap[month]++;
            }

            const monthlyBooking = monthlyBookingMap.map((count, index) => ({
                month: new Date(currentYear, index).toLocaleString('default', { month: 'long' }),
                totalBooking: count
            }));

            return monthlyBooking;
        } catch (error) {
            console.error('Error in grahpBookingMonthlyService:', error.message);
            throw new Error(`Failed to get monthly booking data: ${error.message}`);
        }
    },
};