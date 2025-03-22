import prisma from "../../../prisma/prisma.client.js";
import { 
    getAuth, 
    confirmPasswordReset, 
} from "../../../firebase/config.js"

import { FIREBASE_CONFIG } from "../../utils/env.js";
import { encrypt } from "../../utils/encrypt.js";

export const resetPasswordService = async (oobCode, newPassword) => {
    const auth = getAuth();

    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_CONFIG.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oobCode }),
            },
        );
        const data = await response.json();

        await confirmPasswordReset(auth, oobCode, newPassword);

        newPassword = encrypt(newPassword);

        const userInPrisma = await prisma.user.findUnique({
                where: {
                    email: data.email,
            },
        });

        await prisma.user.update({
            where: {
                id: userInPrisma.id,
            },
            data: {
                password: newPassword,
            },
        });
        
        return { message: "Password successfully changed." };
    }
    catch (error) {
        throw new Error(error.message);
    }
}
// export const resetPasswordService = async (oobCode, newPassword) => {
//     try {
//         const response = await fetch(
//             `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_CONFIG.apiKey}`,
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ oobCode }),
//             },
//         );
        
//         const data = await response.json();
//         if(!response.ok){
//             throw new Error(data.error.message);
//         };

//         newPassword = encrypt(newPassword);

//         const userInFireBase = await firebaseAdmin.admin.auth().getUserByEmail(data.email);
//         await firebaseAdmin.admin.auth().updateUser(
//             userInFireBase.uid,
//             {
//                 password: newPassword,
//             }
//         );

//         const userInPrisma = await prisma.user.findUnique({
//             where: {
//                 email: data.email,
//             },
//         });

//         await prisma.user.update({
//             where: {
//                 id: userInPrisma.id,
//             },
//             data: {
//                 password: newPassword,
//             },
//         })

//         return{
//             message: "Password successfully changed",
//         }
//     } catch (error) {
//         console.log(error.message);
//         throw new Error(error.message);
//     }
// }