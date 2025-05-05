import prisma from "../../../prisma/prisma.client.js";

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
    }
};
