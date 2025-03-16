import firebaseAdmin from "../../../firebase/firebase.admin.js";
import prisma from "../../../prisma/prisma.client.js";
import { FRONTEND_URL } from "../../utils/env.js";

export const forgotPasswordService = async (email) => {
    const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    }
                });
    if(!user){
        throw new Error("user email not found");
    };

    try {
        await firebaseAdmin.admin.auth().getUserByEmail(email)
    } catch (error) {
        throw new Error("user email not found");
    };

    const actionCodeSettings = {
        url: `${FRONTEND_URL}/reset-password`,
        handleCodeInApp: true
    };

    const link = await firebaseAdmin.admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    return link; 
};