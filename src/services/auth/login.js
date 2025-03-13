import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/firebase.admin.js";
import { encrypt } from "../../utils/encrypt.js";
import { generateToken } from "../../utils/jwt.js";

export const loginUser = async ({ email, password }) => {
    try {
        const userIdentifier = await prisma.users.findUnique({ where: {email} });
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

        // if(!userFromFirebase.emailVerified){
        //     throw new Error("user not verified");
        // };

        const token = generateToken({
            id: userIdentifier.id,
            role: userIdentifier.role,
        })

        return token;      
    } catch (error) {
        return error.message;
    }
};