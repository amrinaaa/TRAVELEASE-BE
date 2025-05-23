import prisma from "../../../../prisma/prisma.client.js";

//klo mau dipake
// function calculateDuration(departureTime, arrivalTime) {
//     const milliseconds = arrivalTime - departureTime;
//     const hours = Math.floor(milliseconds / (1000 * 60 * 60));
//     const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}h ${minutes}m`;
// };

function generateFlightCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    const randomLetters = Array.from({ length: 2 }, () =>
        letters[Math.floor(Math.random() * letters.length)]
    ).join('');

    const randomNumbers = Array.from({ length: 2 }, () =>
        numbers[Math.floor(Math.random() * numbers.length)]
    ).join('');

    return randomLetters + randomNumbers;
}

export default {
    async addAirlineService(mitraId, name, description) {
        try {
            const existingAirline = await prisma.airline.findFirst({
                where: { name }
            });

            if (existingAirline) {
                throw new Error('Airline is exist')
            };

            const result = await prisma.$transaction(async (tx) => {
                // Buat airline baru
                const newAirline = await tx.airline.create({
                    data: {
                        name,
                        description
                    }
                });

                // Periksa apakah mitra/partner ada
                const partner = await tx.user.findUnique({
                    where: { id: mitraId }
                });

                if (!partner) {
                    throw new Error('Partner not found');
                }

                // Buat relasi airlinePartner
                await tx.airlinePartner.create({
                    data: {
                        airlineId: newAirline.id,
                        partnerId: mitraId
                    }
                });

                // Ambil data airline lengkap dengan relasi
                const airlineWithRelations = await tx.airline.findUnique({
                    where: { id: newAirline.id },
                    include: {
                        airlinePartners: {
                            include: {
                                partner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                });

                return airlineWithRelations;
            });

            return result;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async getAirlinesService(mitraId) {
        try {
            const mitra = await prisma.user.findUnique({
                where: { id: mitraId }
            });

            if (!mitra) {
                throw new Error('Partner not found');
            }

            const mitraAirlines = await prisma.airlinePartner.findMany({
                where: {
                    partnerId: mitraId
                },
                include: {
                    airline: {
                        include: {
                            planes: true
                        }
                    }
                }
            });

            // Format output agar lebih mudah dikonsumsi frontend
            const formattedAirlines = mitraAirlines.map(item => ({
                id: item.airline.id,
                name: item.airline.name,
                description: item.airline.description,
            }));

            return formattedAirlines;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async updateAirlineService(
        airlineId,
        name,
        description
    ) {
        try {
            const existingAirline = await prisma.airline.findUnique({
                where: {
                    id: airlineId
                }
            });

            if (!existingAirline) {
                throw new Error('Maskapai tidak ditemukan');
            };

            const updateAirline = await prisma.airline.update({
                where: {
                    id: airlineId,
                },
                data: {
                    ...(name && { name }),
                    ...(description && { description }),
                },
            });

            return updateAirline;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async deleteAirlineService(airlineId) {
        try {
            return await prisma.$transaction(async (tx) => {
                // Delete airline partners
                await tx.airlinePartner.deleteMany({
                    where: { airlineId }
                });

                // Get all planes of the airline
                const planes = await tx.plane.findMany({
                    where: { airlineId },
                    include: {
                        seatCategories: { include: { seats: true } },
                        flights: true
                    }
                });

                for (const plane of planes) {
                    // Delete all tickets from seats
                    for (const seatCategory of plane.seatCategories) {
                        for (const seat of seatCategory.seats) {
                            await tx.ticket.deleteMany({
                                where: { seatId: seat.id }
                            });
                        }

                        // Delete seats
                        await tx.seat.deleteMany({
                            where: { seatCategoryId: seatCategory.id }
                        });
                    }

                    // Delete seat categories
                    await tx.seatCategory.deleteMany({
                        where: { planeId: plane.id }
                    });

                    // Delete tickets from flights
                    for (const flight of plane.flights) {
                        await tx.ticket.deleteMany({
                            where: { flightId: flight.id }
                        });
                    }

                    // Delete flights
                    await tx.flight.deleteMany({
                        where: { planeId: plane.id }
                    });
                }

                // Delete planes
                await tx.plane.deleteMany({
                    where: { airlineId }
                });

                // Finally, delete airline
                const deletedAirline = await tx.airline.delete({
                    where: { id: airlineId }
                });

                return {
                    id: deletedAirline.id,
                    name: deletedAirline.name
                };
            });
        } catch (error) {
            throw new Error(`Failed to delete airline: ${error.message}`);
        }
    },

    async getPlaneTypesService() {
        try {
            const planeTypes = await prisma.planeType.findMany({
                orderBy: {
                    name: 'asc'
                }
            });

            return planeTypes;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async addPlaneTypeService(name, manufacture) {
        try {
            const existingPlaneType = await prisma.planeType.findFirst({
                where: { name }
            });

            if (existingPlaneType) {
                throw new Error('Type is exist')
            };

            const newPlaneType = await prisma.planeType.create({
                data: {
                    name,
                    manufacture,
                },
            });

            return newPlaneType;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async getPlanesService(airlineId) {
        try {
            const plane = await prisma.plane.findMany({
                where: {
                    airlineId,
                },
                select: {
                    id: true,
                    name: true,
                    planeType: {
                        select: {
                            name: true,
                            manufacture: true,
                        },
                    },
                },
            });

            return plane;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async addPlaneService(planeTypeId, airlineId, name, seatCategories) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                // Create the plane
                const plane = await tx.plane.create({
                    data: {
                        name,
                        planeTypeId,
                        airlineId,
                    }
                });

                // If seat categories are provided, create them
                if (seatCategories && seatCategories.length > 0) {
                    for (const category of seatCategories) {
                        await tx.seatCategory.create({
                            data: {
                                name: category.name,
                                price: category.price,
                                planeId: plane.id,
                            }
                        });
                    }
                }

                return plane;
            });

            return {
                id: result.id,
                name: result.name,
                planeTypeId: result.planeTypeId,
                airlineId: result.airlineId
            };
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async deletePlaneService(planeId) {
        try {
            return await prisma.$transaction(async (tx) => {

                const seatCategories = await tx.seatCategory.findMany({
                    where: { planeId },
                    include: { seats: true }
                });

                for (const category of seatCategories) {
                    for (const seat of category.seats) {
                        await tx.ticket.deleteMany({
                            where: { seatId: seat.id }
                        });
                    }

                    await tx.seat.deleteMany({
                        where: { seatCategoryId: category.id }
                    });
                }

                await tx.seatCategory.deleteMany({
                    where: { planeId }
                });

                const flights = await tx.flight.findMany({
                    where: { planeId }
                });

                for (const flight of flights) {
                    await tx.ticket.deleteMany({
                        where: { flightId: flight.id }
                    });
                }

                await tx.flight.deleteMany({
                    where: { planeId }
                });

                const deletedPlane = await tx.plane.delete({
                    where: { id: planeId }
                });

                return {
                    id: deletedPlane.id,
                    name: deletedPlane.name
                };
            });
        } catch (error) {
            throw new Error(`Failed to delete plane: ${error.message}`);
        }
    },

    async getSeatCategoryService(planeId) {
        try {
            const categories = await prisma.seatCategory.findMany({
                where: {
                    planeId
                },
                select: {
                    id: true,
                    name: true,
                },
            });

            return categories;
        } catch (error) {
            throw new Error(error.message);
        };
    },
 
    async getPlaneSeatsService(planeId) {
        try {
            const seatCategories = await prisma.seatCategory.findMany({
                where: {
                    planeId
                },
                include: {
                    seats: true
                }
            });

            // Format respons
            const result = seatCategories.map(category => {
                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    price: category.price,
                    seats: category.seats.map(seat => {
                        return {
                            id: seat.id,
                            name: seat.name
                        };
                    })
                };
            });

            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async addPlaneSeatService(
        planeId,
        seatCategoryId,
        seatArrangement,
    ) {
        try {
            const seatCategory = await prisma.seatCategory.findFirst({
                where: {
                    planeId: planeId,
                    id: seatCategoryId,
                }
            });

            if (!seatCategory) {
                throw new Error('Kategori kursi tidak ditemukan untuk pesawat ini')
            };

            const result = await prisma.$transaction(async (tx) => {
                // Buat kursi untuk setiap baris dan kolom yang didefinisikan
                const createdSeats = [];
                const seatsToCreate = [];

                for (const row of seatArrangement) {
                    const { line, start, end } = row;

                    for (let seatNum = parseInt(start); seatNum <= parseInt(end); seatNum++) {
                        const seatName = `${line}${seatNum}`;
                        seatsToCreate.push({
                            seatCategoryId: seatCategoryId,
                            name: seatName
                        });
                    }
                }

                // Buat kursi secara massal untuk kinerja yang lebih baik
                if (seatsToCreate.length > 0) {
                    await tx.seat.createMany({
                        data: seatsToCreate
                    });
                }

                // Ambil semua kursi yang baru saja dibuat
                const seats = await tx.seat.findMany({
                    where: {
                        seatCategoryId: seatCategoryId
                    },
                    orderBy: {
                        name: 'asc'
                    }
                });

                return {
                    seats: seats,
                    seatCount: seats.length
                };
            });

            return {
                // id: result.category.id,
                // planeId: result.category.planeId,
                // name: result.category.name,
                // price: result.category.price,
                seatCount: result.seatCount,
                seats: result.seats.map(seat => ({
                    id: seat.id,
                    name: seat.name
                }))
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async deletePlaneSeatService(seatId) {
        try {
            const existingSeat = await prisma.seat.findUnique({
                where: {
                    id: seatId
                },
                include: {
                    tickets: true,
                    seatCategory: {
                        include: {
                            plane: true
                        }
                    }
                }
            });

            const result = await prisma.$transaction(async (tx) => {
                // Jika kursi memiliki tiket, hapus semua tiket terkait terlebih dahulu
                if (existingSeat.tickets.length > 0) {
                    await tx.ticket.deleteMany({
                        where: {
                            seatId
                        }
                    });
                }

                // Setelah tiket dihapus, hapus kursi
                const deletedSeat = await tx.seat.delete({
                    where: {
                        id: seatId
                    },
                    include: {
                        seatCategory: {
                            select: {
                                name: true,
                                plane: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });

                return {
                    id: deletedSeat.id,
                    name: deletedSeat.name,
                    categoryName: deletedSeat.seatCategory.name,
                    planeName: deletedSeat.seatCategory.plane.name,
                    ticketsDeleted: existingSeat.tickets.length
                };
            });

            return result;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async addFlightService(
        planeId,
        departureAirportId,
        arrivalAirportId,
        departureTime,
        arrivalTime,
        price,
    ) {
        try {
            const parsedDepartureTime = new Date(departureTime);
            const parsedArrivalTime = new Date(arrivalTime);

            if (parsedArrivalTime <= parsedDepartureTime) {
                throw new Error('Arrival time must be after departure time');
            };

            const overlappingFlights = await prisma.flight.findMany({
                where: {
                    planeId: planeId,
                    OR: [
                        // Penerbangan baru mulai saat penerbangan lain sedang berlangsung
                        {
                            departureTime: {
                                lte: parsedDepartureTime
                            },
                            arrivalTime: {
                                gte: parsedDepartureTime
                            }
                        },
                        // Penerbangan baru berakhir saat penerbangan lain sedang berlangsung
                        {
                            departureTime: {
                                lte: parsedArrivalTime
                            },
                            arrivalTime: {
                                gte: parsedArrivalTime
                            }
                        },
                        // Penerbangan baru mencakup seluruh penerbangan lain
                        {
                            departureTime: {
                                gte: parsedDepartureTime
                            },
                            arrivalTime: {
                                lte: parsedArrivalTime
                            }
                        }
                    ]
                }
            });

            if (overlappingFlights.length > 0) {
                throw new Error('Pesawat sudah dijadwalkan untuk penerbangan lain pada waktu tersebut');
            };

            const flightCodeGenerated = generateFlightCode()
            const existingFlightCode = await prisma.flight.findFirst({
                where: {
                    flightCode: flightCodeGenerated,
                },
            });

            if (existingFlightCode) {
                throw new Error(`Kode penerbangan ${flightCodeGenerated} sudah digunakan`);
            };

            const newFlight = await prisma.flight.create({
                data: {
                    planeId,
                    departureAirportId,
                    arrivalAirportId,
                    flightCode: flightCodeGenerated,
                    departureTime: parsedDepartureTime,
                    arrivalTime: parsedArrivalTime,
                    price,
                },
                include: {
                    plane: {
                        include: {
                            airline: true
                        }
                    },
                    departureAirport: true,
                    arrivalAirport: true
                }
            });

            return {
                id: newFlight.id,
                flightCode: newFlight.flightCode,
                airline: newFlight.plane.airline.name,
                plane: {
                    id: newFlight.plane.id,
                    name: newFlight.plane.name
                },
                departure: {
                    airport: newFlight.departureAirport.name,
                    code: newFlight.departureAirport.code,
                    city: newFlight.departureAirport.city,
                    time: newFlight.departureTime
                },
                arrival: {
                    airport: newFlight.arrivalAirport.name,
                    code: newFlight.arrivalAirport.code,
                    city: newFlight.arrivalAirport.city,
                    time: newFlight.arrivalTime
                },
                // duration: calculateDuration(newFlight.departureTime, newFlight.arrivalTime),
            };

        } catch (error) {
            throw new Error(error.message);
        };
    },

    async deleteFlightService(flightId) {
        try {
            return await prisma.$transaction(async (tx) => {
                // Hapus semua ticket yang terkait dengan flight ini
                await tx.ticket.deleteMany({
                    where: { flightId }
                });

                // Hapus flight
                const deletedFlight = await tx.flight.delete({
                    where: { id: flightId }
                });

                return {
                    id: deletedFlight.id,
                    flightCode: deletedFlight.flightCode
                };
            });
        } catch (error) {
            throw new Error(`Failed to delete flight: ${error.message}`);
        }
    },

    async getPassengersService(flightId) {
        try {
            const tickets = await prisma.ticket.findMany({
                where: {
                    flightId: flightId
                },
                include: {
                    seat: {
                        include: {
                            seatCategory: true
                        }
                    },
                    transaction: {
                        select: {
                            status: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    seat: {
                        name: 'asc'
                    }
                }
            });

            const passengers = tickets.map(ticket => {
                return {
                    ticketId: ticket.id,
                    passengerName: ticket.name,
                    passengerNIK: ticket.nik,
                    gender: ticket.gender,
                    type: ticket.type,
                    seat: {
                        id: ticket.seat.id,
                        name: ticket.seat.name,
                        category: ticket.seat.seatCategory.name,
                        price: ticket.seat.seatCategory.price
                    },
                    bookedBy: {
                        userId: ticket.transaction.user.id,
                        name: ticket.transaction.user.name,
                        email: ticket.transaction.user.email
                    },
                    paymentStatus: ticket.transaction.status
                };
            });

            // Siapkan ringkasan statistik
            const stats = {
                totalPassengers: tickets.length,
                adultCount: tickets.filter(t => t.type === 'ADULT').length,
                childrenCount: tickets.filter(t => t.type === 'CHILDREN').length,
                paidTickets: tickets.filter(t => t.transaction.status === 'PAID').length,
                unpaidTickets: tickets.filter(t => t.transaction.status !== 'PAID').length
            };

            return {
                stats: stats,
                passengers: passengers
            };
        } catch (error) {
            throw new Error(error.message);
        };
    },
};