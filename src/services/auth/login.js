import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/firebase.admin.js";
import { encrypt } from "../../utils/encrypt.js";
import { generateToken } from "../../utils/jwt.js";

export const loginService = async ({ email, password }) => {
    try {
        const userIdentifier = await prisma.user.findUnique({ where: {email} });
        if(!userIdentifier){
            throw new Error("email or password failed");
        };

        const validatePassword = encrypt(password) === userIdentifier.password;
        if(!validatePassword){
            throw new Error("email or password failed")
        };

        let userFromFirebase;
        try {
            userFromFirebase = await firebaseAdmin.admin.auth().getUser(userIdentifier.id)
        } catch (error) {
            if (error.code !== "auth/user-not-found") {
                throw error;
            }
        };

        // if (!userFromFirebase.emailVerified) {
        //     throw new Error("Email belum diverifikasi. Silakan cek email Anda untuk verifikasi.");
        // }

        // if (userFromFirebase.emailVerified !== userIdentifier.isVerified) {
        //     await prisma.user.update({
        //         where: { email },
        //         data: { isVerified: userFromFirebase.emailVerified },
        //     });
        // }

        const token = generateToken({
            id: userIdentifier.id,
            role: userIdentifier.role,
        })

        return token;      
    } catch (error) {
        throw new Error(error.message);
    }
};