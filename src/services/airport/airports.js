import prisma from "../../../prisma/prisma.client.js";

export const getAirportServise = async () => {
    try {
        const airports = await prisma.airport.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                city: true,
                imageUrl: true,
            },
        });

        return airports;
    } catch (error) {
        throw new Error(error.message);
    };
};