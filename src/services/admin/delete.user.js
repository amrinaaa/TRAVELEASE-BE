import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";

export const deleteUserService = async (uid) => {
    try {
        await firebaseAdmin.admin.auth().deleteUser(uid);

        await prisma.user.delete({
            where: {
                id: uid,
            }
        });

        return {
            message: "Removing partner successful",
        };
    } catch (error) {
        throw new Error(error.message);   
    }
};