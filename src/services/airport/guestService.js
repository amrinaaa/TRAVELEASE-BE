import prisma from "../../../prisma/prisma.client.js";

export default {
    async getCityFlightService (city) {
        const airport = await prisma.airport.findMany({
            where: {
                city: {
                    equals: city,
                    mode: "insensitive",
                },
            },
        });
        return airport;
    },

    async getFlightsService () {
        const flights = await prisma.flight.findMany({
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                arrivalAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                plane: {
                    select: {
                        name: true,
                        seatCategories: {
                            select: {
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });
    
        return flights;
    },

    async getFlightsByDepartureAirportService (airportIds) {
        const flights = await prisma.flight.findMany({
            where: {
                departureAirportId: {
                    in: airportIds,
                },
            },
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                arrivalAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                plane: {
                    select: {
                        name: true,
                        seatCategories: {
                        select: {
                            name: true,
                            price: true,
                            },
                        },
                    },
                },
            },
        }); 
    return flights;
},

    async getFlightsByArrivalAirportService (airportIds) {
        const flights = await prisma.flight.findMany({
            where: {
                arrivalAirportId: {
                    in: airportIds,
                },
            },
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                arrivalAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                plane: {
                    select: {
                        name: true,
                        seatCategories: {
                        select: {
                            name: true,
                            price: true,
                            },
                        },
                    },
                },
            },
        });
    return flights;
},

    async getFlightsByDepartureandArrivalAirportService (departureAirportIds, arrivalAirportIds) {
        const flights = await prisma.flight.findMany({
            where: {
                departureAirportId: {
                    in: departureAirportIds,
                },
                arrivalAirportId: {
                    in: arrivalAirportIds,
                },
            },
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                arrivalAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                plane: {
                    select: {
                        name: true,
                        seatCategories: {
                        select: {
                            name: true,
                            price: true,
                            },
                        },
                    },
                },
            },
        });
    return flights;
},

    async searchByDepartureAirportCityService (city) {
        const airports = await prisma.airport.findMany({
            where: {
                city: {
                    contains: city,
                    mode: "insensitive",
                },
            },
        });

        if (airports.length === 0) {
            return [];
        }

        const airportIds = airports.map((airport) => airport.id);
        return await this.getFlightsByDepartureAirportService(airportIds);
    },

    async searchByArrivalAirportCityService (city) {
        const airports = await prisma.airport.findMany({
            where: {
                city: {
                    contains: city,
                    mode: "insensitive",
                },
            },
        });

        if (airports.length === 0) {
            return [];
        }

        const airportIds = airports.map((airport) => airport.id);
        return await this.getFlightsByArrivalAirportService(airportIds);
    },

    async searchByDepartureandArrivalAirportCityService (departureCity, arrivalCity) {
        const departureAirports = await prisma.airport.findMany({
            where: {
                city: {
                    contains: departureCity,
                    mode: "insensitive",
                },
            },
        });
    
        const arrivalAirports = await prisma.airport.findMany({
            where: {
                city: {
                    contains: arrivalCity,
                    mode: "insensitive",
                },
            },
        });
    
        if (departureAirports.length === 0 || arrivalAirports.length === 0) {
            return { message: "No matching airports found", data: null };
        }
    
        const departureAirportIds = departureAirports.map(airport => airport.id);
        const arrivalAirportIds = arrivalAirports.map(airport => airport.id);
    
        return await this.getFlightsByDepartureandArrivalAirportService(departureAirportIds, arrivalAirportIds);
    },

    async searchFlightsByDepartureorReturnTimeService(departureDate, returnDate) {
        let filters = [];
    
        if (departureDate) {
            filters.push({
                departureTime: {
                    gte: new Date(departureDate.setHours(0, 0, 0, 0)),
                    lte: new Date(departureDate.setHours(23, 59, 59, 999))
                }
            });
        }
    
        if (returnDate) {
            filters.push({
                arrivalTime: {
                    gte: new Date(returnDate.setHours(0, 0, 0, 0)),
                    lte: new Date(returnDate.setHours(23, 59, 59, 999))
                }
            });
        }
    
        const flights = await prisma.flight.findMany({
            where: {
                OR: filters.length > 0 ? filters : undefined,
            },
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: { 
                    select: { 
                        name: true, 
                        city: true } },
                arrivalAirport: { 
                    select: { 
                        name: true, 
                        city: true } },
                plane: {
                    select: {
                        name: true,
                        seatCategories: { 
                            select: { 
                                name: true, 
                                price: true } }
                    }
                }
            }
        });
    
        return flights.map((flight) => ({
            ...flight,
            departureTime: new Intl.DateTimeFormat("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            }).format(new Date(flight.departureTime)),
            arrivalTime: new Intl.DateTimeFormat("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            }).format(new Date(flight.arrivalTime)),
        }));
    },

    async searchFlightsBySeatCategoryService () {
        const flights = await prisma.flight.findMany({
            where: {
                plane: {
                    seatCategories: {
                        some: {
                            name: {
                                in: ["Business", "Economy"],
                            },
                        },
                    },
                },
            },
            select: {
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                arrivalAirport: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                plane: {
                    select: {
                        name: true,
                        seatCategories: {
                        select: {
                            name: true,
                            price: true,
                        },
                        },
                    },
                },
            },
        });
        return flights;
    },
};
