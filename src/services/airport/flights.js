import prisma from "../../../prisma/prisma.client.js";

function formatTime(dateObj) {
    const date = new Date(dateObj);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}.${minutes}`;
}

export default {
    async getCityFlightService (city) {
        const airport = await prisma.airport.findMany({
            where: { 
                city: { equals: city, mode: "insensitive", }, }, }); 
            return airport; 
        },

    async getFlightsService() {    
        const flights = await prisma.flight.findMany({
            select: {
                id: true,
                flightCode: true,
                departureTime: true,
                arrivalTime: true,
                departureAirport: {
                    select: { 
                        name: true, 
                        city: true, 
                        code: true },
                },
                arrivalAirport: {
                    select: { 
                        name: true, 
                        city: true, 
                        code: true },
                },
                plane: {
                    select: { 
                        name: true,
                        planeType: {
                            select: {
                                name: true,
                                manufacture: true,
                            },
                        },
                    }, 
                }, 
            }, 
        });

        return flights;
    },
    async filterFlights(query) {
        const { from, to, departureDate, returnDate, seatCategory, passengers } = query;
    
        const seatFilter = seatCategory || passengers ? {
            plane: {
                seatCategories: {
                    some: {
                        ...(seatCategory && {
                            name: {
                                equals: seatCategory,
                                mode: "insensitive"
                            }
                        }),
                        ...(passengers && {
                            seats: {
                                some: {} 
                            }
                        })
                    }
                }
            }
        } : {};
    
        const departureFilter = {
            ...seatFilter,
            ...(from && {
                departureAirport: {
                    city: {
                        contains: from,
                        mode: "insensitive"
                    }
                }
            }),
            ...(to && {
                arrivalAirport: {
                    city: {
                        contains: to,
                        mode: "insensitive"
                    }
                }
            }),
            ...(departureDate && {
                departureTime: {
                    gte: new Date(departureDate)
                }
            })
        };
    
        const departureFlights = await prisma.flight.findMany({
            where: departureFilter,
            include: {
                departureAirport: true,
                arrivalAirport: true,
                plane: {
                    include: {
                        seatCategories: true
                    }
                }
            }
        });
    
        let returnFlights = [];
        if (returnDate && from && to) {
            const returnFilter = {
                ...seatFilter,
                departureAirport: {
                    city: {
                        contains: to,
                        mode: "insensitive"
                    }
                },
                arrivalAirport: {
                    city: {
                        contains: from,
                        mode: "insensitive"
                    }
                },
                departureTime: {
                    gte: new Date(returnDate)
                }
            };
    
            returnFlights = await prisma.flight.findMany({
                where: returnFilter,
                include: {
                    departureAirport: true,
                    arrivalAirport: true,
                    plane: {
                        include: {
                            seatCategories: true
                        }
                    }
                }
            });
        }
    
        const formatFlight = (flight) => {
            const seat = flight.plane.seatCategories.find(
                (cat) => cat.name.toLowerCase() === (seatCategory || "").toLowerCase()
            );
    
            const price = seat?.price
                ? `Rp ${seat.price.toLocaleString("id-ID")}`
                : "N/A";
    
            return {
                airline: flight.plane.name,
                departure: {
                    city: flight.departureAirport.city,
                    time: formatTime(flight.departureTime),
                },
                arrival: {
                    city: flight.arrivalAirport.city,
                    time: formatTime(flight.arrivalTime),
                },
                class: seat ? seat.name : "Economy",
                price,
            };
        };
    
        return {
            departureFlights: departureFlights.map(formatFlight),
            returnFlights: returnFlights.map(formatFlight),
        };
    }
};    
