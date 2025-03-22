import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";

export const deleteUserService = async ({uid, role}) => {
    try {
        await firebaseAdmin.admin.auth().deleteUser(uid);

        await prisma.user.delete({
            where: {
                id: uid,
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