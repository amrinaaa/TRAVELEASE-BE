import prisma from "../../../prisma/prisma.client.js";

export const getUsersService = async ({role}) => {
    try {
        const result = await prisma.user.findMany({
            where: {
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                currentAmount: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};