import prisma from "../../../prisma/prisma.client.js";
import { getAuth, sendPasswordResetEmail } from "../../../firebase/config.js";
import { FRONTEND_URL } from "../../utils/env.js";

export const forgotPasswordService = async (email) => {
    const user = await prisma.user.findUnique({
                    where: {
                        email,
                    }
                });
    if(!user){
        throw new Error("user email not found");
    };

    try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email, {
            url: `${FRONTEND_URL}/reset-password`,
            handleCodeInApp: true
        });

        return { message: "Password reset email sent successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

// export const forgotPasswordService = async (email) => {
//     const user = await prisma.user.findUnique({
//                     where: {
//                         email,
//                     }
//                 });
//     if(!user){
//         throw new Error("user email not found");
//     };

//     try {
//         await firebaseAdmin.admin.auth().getUserByEmail(email)
//     } catch (error) {
//         throw new Error("user email not found");
//     };

//     const actionCodeSettings = {
//         url: `${FRONTEND_URL}/reset-password`,
//         handleCodeInApp: true
//     };

//     const link = await firebaseAdmin.admin.auth().generatePasswordResetLink(email, actionCodeSettings);
//     return link; 
// };