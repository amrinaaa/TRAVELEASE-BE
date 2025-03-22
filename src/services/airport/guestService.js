import prisma from "../../../prisma/prisma.client.js";

export const getCityFlightService = async (city) => {
    const airport = await prisma.airport.findMany({
        where: {
            city: {
                equals: city,
                mode: "insensitive",
            },
        },
    });
    return airport;
};

export const getFlightsService = async () => {
    const flights = await prisma.flight.findMany({
        include: {
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
        },
    });

    return flights;
};

export const getFlightsByDepartureAirportService = async (airportIds) => {
    const flights = await prisma.flight.findMany({
        where: {
            departureAirportId: {
                in: airportIds,
            },
        },
        include: {
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
                    id: true,
                },
            },
        },
    });
    
    return flights;
};

export const searchByDepartureAirportCityService = async (city) => {
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
    return await getFlightsByDepartureAirportService(airportIds);
};