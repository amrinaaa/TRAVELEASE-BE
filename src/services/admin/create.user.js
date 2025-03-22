import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";
import { encrypt } from "../../utils/encrypt.js";

export const createUser = async ({
    name, email, password, role
}) => {
    try {
        const existingUserPrisma = await prisma.user.findUnique({ where: {email} });
        if(existingUserPrisma){
            throw new Error("email already registered")
        };

        try {
            await firebaseAdmin.admin.auth().getUserByEmail(email);
            throw new Error("email already registered");
        } catch (error) {
            if (error.code !== "auth/user-not-found") {
                throw error;
            }
        };

        password= encrypt(password);

        const userFirebase = await firebaseAdmin.admin.auth().createUser({
            email, password
        });
        
        const userPrisma = await prisma.user.create({
            data: {
                id: userFirebase.uid,
                name,
                email,
                password,
                role,
            },
        });
        
        return { 
            user: userPrisma, 
        };

    } catch (error) {
       throw new Error(error.message)
    }
}