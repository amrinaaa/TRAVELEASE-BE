import prisma from "../../../prisma/prisma.client.js";

export default {
    async getAirportServise () {
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
    },

    async addAirportServise(name, code, city) {
        try {
            const airport = await prisma.airport.create({
                data: {
                    name,
                    code,
                    city
                },
            });

            return airport;
        } catch (error) {
            throw new Error(error.message);
        }
    },
};