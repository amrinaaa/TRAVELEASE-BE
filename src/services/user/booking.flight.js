import prisma from "../../../prisma/prisma.client.js";

export default {
    async bookingFlightService(userId, flightId, passengers) {
        try {
            //ngambil data penerbangan buat dipake untuk validasi waktu & kursi yg tersedia
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

            //validasi kapan tiket di pesan berdasarkan waktu dari penerbangannya
            const now = new Date();
            const departureDate = new Date(flight.departureTime);
            const timeDiff = departureDate.getTime() - now.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);

            if (daysDiff < 1) {
                throw new Error('Pemesanan minimal 1 hari sebelum tanggal keberangkatan.');
            };

            //menghitung total kursi yang di booking
            const seatIds = passengers.map(passenger => passenger.seatId);

            //validasi kursi-kursi tersebut ada atau tidak di penerbangan tersebut
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

            //validasi apakah kursi tersedia
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

            //Menhitung total harga berdasarkan harga flight + kategori kursi
            let totalPrice = 0;
            const seatPriceMap = {};
            
            // Mangambil harga flightnya
            const baseFlightPrice = flight.price;
            
            for (const seat of seats) {
                // Menjumlahkan harga flight + kategori kursi
                const price = baseFlightPrice + seat.seatCategory.price;
                seatPriceMap[seat.id] = price;
                totalPrice += price;
            };

            //menggunakan transaction agar jika terjadi error langsung ke rollback
            return await prisma.$transaction(async (tx) => {
                // Membuat transaksi
                const transaction = await tx.transaction.create({
                    data: {
                        userId: userId,
                        transactionType: 'PURCHASE',
                        price: totalPrice,
                        status: 'ORDERED',
                    }
                });

                // Membuat tiket untuk tiap-tiap penumpang
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
};