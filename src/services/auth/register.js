import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/firebase.admin.js";
import { encrypt } from "../../utils/encrypt.js";

export const registerUser = async ({
    name, email, password
}) => {
    try {
        const existingUserPrisma = await prisma.users.findUnique({ where: {email} });
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
        }

        password= encrypt(password);

        const userFirebase = await firebaseAdmin.admin.auth().createUser({
            email, password
        });
        
        const verificationLink = await firebaseAdmin.admin.auth().generateEmailVerificationLink(email);

        const userPrisma = await prisma.users.create({
            data: {
                id: userFirebase.uid,
                name,
                email,
                password,
                isVerified: false,
            },
        });
        
        return { user: userPrisma, verificationLink };

    } catch (error) {
        return error.message;
    }
}