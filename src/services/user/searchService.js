import prisma from "../../../prisma/prisma.client.js";
import getCity from "../airport/flights.js";

export default {
    async getDepartureAndArrivalAirports(from, to) {
        const departureAirports = await getCity.getCityFlightService(from);
        const arrivalAirports = await getCity.getCityFlightService(to);
        return { departureAirports, arrivalAirports };
    },

    async getFlightsByAirports(departureAirportIds, arrivalAirportIds) {
        const where = {};

        if (departureAirportIds.length > 0) {
            where.departureAirportId = { in: departureAirportIds };
        }

        if (arrivalAirportIds.length > 0) {
            where.arrivalAirportId = { in: arrivalAirportIds };
        }

        return await prisma.flight.findMany({
            where,
            include: {
                departureAirport: true,
                arrivalAirport: true,
                plane: {
                    include: {
                        airline: true,
                        seatCategories: true,
                    }
                }
            }
        });
    },

    async getAvailableSeatsCountForFlight(flightId) {
        const flight = await prisma.flight.findUnique({
            where: { id: flightId },
            include: {
                plane: {
                    include: {
                        seatCategories: {
                            include: {
                                seats: {
                                    include: {
                                        tickets: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const result = {};

        for (const category of flight.plane.seatCategories) {
            let count = 0;
            for (const seat of category.seats) {
                const isTaken = seat.tickets.some(ticket => ticket.flightId === flightId);
                if (!isTaken) {
                    count++;
                }
            }
            result[category.name.toLowerCase()] = {
                id: category.id,
                name: category.name,
                price: category.price,
                availableSeats: count,
            };
        }

        return result;
    },

    async filterFlightsByPassenger(flights, passenger, seatCategory) {
        const filteredFlights = [];

        const seatCategoryKeywords = seatCategory
            ? seatCategory.toLowerCase().split(',').map(k => k.trim())
            : [];

        for (const flight of flights) {
            const seatAvailability = await this.getAvailableSeatsCountForFlight(flight.id);

            let matchingCategories = Object.values(seatAvailability);

            if (seatCategoryKeywords.length > 0) {
                matchingCategories = matchingCategories.filter(category =>
                    seatCategoryKeywords.some(keyword =>
                        category.name.toLowerCase().includes(keyword)
                    )
                );
            }

            if (matchingCategories.length === 0) continue;

            const filteredCategories = matchingCategories.filter(category =>
                !passenger || category.availableSeats >= parseInt(passenger)
            );

            if (filteredCategories.length === 0) continue;

            filteredFlights.push({
                id: flight.id,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                flightCode: flight.flightCode,
                departureAirport: {
                    id: flight.departureAirport.id,
                    city: flight.departureAirport.city,
                    code: flight.departureAirport.code,
                },
                arrivalAirport: {
                    id: flight.arrivalAirport.id,
                    city: flight.arrivalAirport.city,
                    code: flight.arrivalAirport.code,
                },
                plane: {
                    id: flight.plane.id,
                    airline: {
                        id: flight.plane.airline.id,
                        name: flight.plane.airline.name,
                    },
                    seatCategories: filteredCategories.map(category => ({
                        id: category.id,
                        name: category.name,
                        price: category.price,
                    }))
                }
            });
        }

        return filteredFlights;
    },

    async filterFlightsByDepartureDate(flights, departureDate) {
        if (!departureDate) return flights;

        const date = new Date(departureDate);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        return flights.filter(flight => {
            const depTime = new Date(flight.departureTime);
            return depTime >= startOfDay && depTime <= endOfDay;
        });
    },

    async filterFlights(query) {
        const { from, to, departureDate, seatCategory, passenger } = query;

        let departureFlights = [];

        if (from || to || departureDate) {
            const depAirports = from ? await getCity.getCityFlightService(from) : [];
            const arrAirports = to ? await getCity.getCityFlightService(to) : [];

            if ((from && depAirports.length === 0) || (to && arrAirports.length === 0)) {
                departureFlights = [];

            } else {
                const flightsOut = await this.getFlightsByAirports(
                    depAirports.map(a => a.id),
                    arrAirports.map(a => a.id)
                );

                let filteredFlights = flightsOut;

                if (departureDate) {
                    const depFiltered = await this.filterFlightsByDepartureDate(filteredFlights, departureDate);
                    departureFlights = await this.filterFlightsByPassenger(depFiltered, passenger, seatCategory);
                }

                if (!departureDate) {
                    const allFiltered = await this.filterFlightsByPassenger(filteredFlights, passenger, seatCategory);
                    departureFlights = allFiltered;
                }
            }
        }

        if (!from && !to && !departureDate && (seatCategory || passenger)) {
            const allFlights = await prisma.flight.findMany({
                include: {
                    departureAirport: true,
                    arrivalAirport: true,
                    plane: {
                        include: {
                            airline: true,
                            seatCategories: true,
                        }
                    }
                }
            });

            departureFlights = await this.filterFlightsByPassenger(allFlights, passenger, seatCategory);
        }

        return { departureFlights };
    }
};     
