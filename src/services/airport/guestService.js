import prisma from "../../../prisma/prisma.client.js";


export const getDaerahService = async (city) => {
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