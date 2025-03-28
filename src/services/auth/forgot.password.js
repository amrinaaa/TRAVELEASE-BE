import prisma from "../../../prisma/prisma.client.js";
import firebaseAdmin from "../../../firebase/config.js";
import {  
    getAuth, 
    sendPasswordResetEmail,
} from "../../../firebase/config.js";
import { FRONTEND_URL } from "../../utils/env.js";

export const forgotPasswordService = async (email) => {
    const auth = getAuth(); 
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                message: "Email is not registered in our system.",
            });
        }

        try {
            await firebaseAdmin.admin.auth().getUserByEmail(email);
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                return res.status(404).json({
                    message: "Email not registered in our system.",
                });
            }
            throw error;
        }

        await sendPasswordResetEmail(auth, email, {
            url: `${FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}`,
            handleCodeInApp: true,
        });
        
        return "Please check your email";
    } catch (error) {
        throw new Error(error.message);
    };
};