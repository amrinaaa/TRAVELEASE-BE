import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";

export const deleteUserService = async ({email, role}) => {
    try {
        await prisma.user.delete({
            where: {
                email,
                role,
            }
        });

        return {
            message: "Removing partner successful",
        };
    } catch (error) {
        throw new Error(error.message);   
    }
};