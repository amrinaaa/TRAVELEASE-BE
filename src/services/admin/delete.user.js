import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";

export const deleteUserService = async (uid) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                id: uid,
            },
        });
        if (!existingUser) {
            throw new Error("user not found");
        };

        await firebaseAdmin.admin.auth().deleteUser(existingUser.id);

        await prisma.user.delete({
            where: {
                id: existingUser.id,
            }
        });

        return {
            message: "Removing partner successful",
        };
    } catch (error) {
        throw new Error(error.message);
    }
};
