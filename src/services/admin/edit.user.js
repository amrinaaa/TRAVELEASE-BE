import prisma from "../../../prisma/prisma.client.js";
import firebaseadmin from "../../../firebase/config.js";

export const editUserService = async (id, name, email) => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { 
                id 
            }, 
        });
        if(!existingUser){
            throw new Error("user not found");
        };

        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({ 
                where: { 
                    email 
                } 
            });
            if (emailExists) {
                throw new Error("email is exists");
            }

            await firebaseadmin.admin.auth().updateUser(existingUser.id, { email });

        };

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
              ...(name && { name }),
              ...(email && { email }),
            },
        });

        return updatedUser;
    } catch (error) {
        throw new Error(error.message);
    }
};