import prisma from "../../../prisma/prisma.client.js";

export const searchUserService = async ({email, role}) => {
    try {
        const result = await prisma.user.findUnique({
            where: {
                email,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                currentAmount: true,
                profilePicture: true,
            },
        });

        return result
    } catch (error) {
        throw new Error(error.message);
    };
};