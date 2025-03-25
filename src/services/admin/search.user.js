import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";

export const searchUserService = async ({email, role}) => {
    try {
        //buat memastikan bahwa user ada di firebase dan db
        const identifierFirebase = await firebaseAdmin.admin.auth().getUserByEmail(email);

        const result = await prisma.user.findUnique({
            where: {
                email: identifierFirebase.email,
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
            },
        });

        return result
    } catch (error) {
        throw new Error(error.message);
    };
};