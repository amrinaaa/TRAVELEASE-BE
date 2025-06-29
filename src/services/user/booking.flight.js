import prisma from "../../../prisma/prisma.client.js";

export default {
    async bookingFlightService(userId, flightId, passengers) {
        try {
            
            const flight = await prisma.flight.findUnique({
                where: { id: flightId },
                include: {
                    departureAirport: true,
                    arrivalAirport: true,
                }
            });

            if (!flight) {
                throw new Error('Invalid flight. Flight not found.');
            };

            const now = new Date();
            const departureDate = new Date(flight.departureTime);
            const timeDiff = departureDate.getTime() - now.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);

            if (daysDiff < 1) {
                throw new Error('Pemesanan minimal 1 hari sebelum tanggal keberangkatan.');
            };

            const seatIds = passengers.map(passenger => passenger.seatId);

            const seats = await prisma.seat.findMany({
                where: {
                    id: { in: seatIds },
                },
                include: {
                    seatCategory: {
                        include: {
                            plane: true
                        }
                    }
                }
            });

            if (seats.length !== seatIds.length) {
                throw new Error('Seats not found.');
            };

            const existingTickets = await prisma.ticket.findMany({
                where: {
                    flightId: flightId,
                    seatId: { in: seatIds }
                }
            });

            if (existingTickets.length > 0) {
                const bookedSeatIds = existingTickets.map(ticket => ticket.seatId);
                throw new Error(`Seats with IDs: ${bookedSeatIds.join(', ')} are already booked.`);
            };

            let totalPrice = 0;
            const seatPriceMap = {};
            const baseFlightPrice = flight.price;
            
            for (const seat of seats) {
                const price = baseFlightPrice + seat.seatCategory.price;
                seatPriceMap[seat.id] = price;
                totalPrice += price;
            };

            return await prisma.$transaction(async (tx) => {
                const transaction = await tx.transaction.create({
                    data: {
                        userId: userId,
                        transactionType: 'PURCHASE',
                        price: totalPrice,
                        status: 'ORDERED',
                    }
                });

                const tickets = await Promise.all(
                    passengers.map(passenger => 
                        tx.ticket.create({
                            data: {
                                transactionId: transaction.id,
                                flightId: flightId,
                                seatId: passenger.seatId,
                                name: passenger.name,
                                nik: passenger.nik,
                                gender: passenger.gender,
                                type: passenger.type
                            }
                        })
                    )
                );

                return {
                    transaction: {
                        id: transaction.id,
                        totalPrice,
                        status: transaction.status
                    },
                    flight: {
                        id: flight.id,
                        flightCode: flight.flightCode,
                        departureAirport: flight.departureAirport.name,
                        arrivalAirport: flight.arrivalAirport.name,
                        departureTime: flight.departureTime,
                        arrivalTime: flight.arrivalTime
                    },
                    tickets: tickets.map(ticket => ({
                        id: ticket.id,
                        name: ticket.name,
                        nik: ticket.nik,
                        seatId: ticket.seatId,
                        type: ticket.type,  
                        gender: ticket.gender
                    }))
                };
            });
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async paymentFlightService(userId, transactionId) {
        try {
            const transaction = await prisma.transaction.findUnique({
                where: { 
                    id: transactionId,
                    userId: userId
                },
                include: {
                    tickets: {
                        include: {
                            flight: {
                                include: {
                                    plane: {
                                        include: {
                                            airline: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!transaction) {
                throw new Error('Transaction not found or does not belong to this user');
            }

            if (transaction.status === 'PAID') {
                throw new Error('This transaction is already paid');
            }

            if (transaction.status === 'CANCELED') {
                throw new Error('Cannot pay for a canceled transaction');
            }

            if (!transaction.tickets || transaction.tickets.length === 0) {
                throw new Error('No tickets found for this transaction');
            }
            
            const bookingTime = transaction.tickets[0].createdAt;
            if (Date.now() - bookingTime.getTime() > 15 * 60 * 1000) {
                await prisma.ticket.deleteMany({
                    where: {
                            transactionId,
                        }
                });
                
                await prisma.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'CANCELED' }
                });
                throw new Error('Waktu pembayaran habis');
            }

            const airlineId = transaction.tickets[0].flight.plane.airline.id;
            const airlinePartner = await prisma.airlinePartner.findFirst({
                where: {
                    airlineId: airlineId
                },
                include: {
                    partner: true
                }
            });

            if (!airlinePartner) {
                throw new Error('No airline partner found for this flight');
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentAmount: true }
            });

            if (user.currentAmount < transaction.price) {
                throw new Error('Saldo Anda Tidak Mencukupi');
            }

            return await prisma.$transaction(async (tx) => {
                const updatedTransaction = await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'PAID' }
                });

                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: {
                        currentAmount: {
                            decrement: transaction.price
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        currentAmount: true
                    }
                });

                // Menambahkan saldo mitra dari hasil penjualan tiket
                await tx.user.update({
                    where: { id: airlinePartner.partnerId },
                    data: {
                        currentAmount: {
                            increment: transaction.price
                        }
                    }
                });

                // Return response data
                return {
                    transaction: {
                        id: updatedTransaction.id,
                        status: updatedTransaction.status,
                        price: updatedTransaction.price
                    },
                    user: {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        currentBalance: updatedUser.currentAmount
                    },
                    partner: {
                        id: airlinePartner.partnerId,
                        name: airlinePartner.partner.name
                    },
                    flight: {
                        id: transaction.tickets[0].flight.id,
                        flightCode: transaction.tickets[0].flight.flightCode,
                        departureTime: transaction.tickets[0].flight.departureTime,
                        arrivalTime: transaction.tickets[0].flight.arrivalTime
                    },
                    tickets: transaction.tickets.map(ticket => ({
                        id: ticket.id,
                        name: ticket.name,
                        nik: ticket.nik,
                        seatId: ticket.seatId,
                        type: ticket.type,
                        gender: ticket.gender
                    }))
                };
            });
        } catch (error) {
            throw new Error(error.message);
        };
    },
};