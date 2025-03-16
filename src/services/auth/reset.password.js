import firebaseAdmin from "../../../firebase/firebase.admin.js";
import prisma from "../../../prisma/prisma.client.js";
import { FIREBASE_API_KEY } from "../../utils/env.js";
import { encrypt } from "../../utils/encrypt.js";

export const resetPasswordService = async (oobCode, newPassword) => {
    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oobCode }),
            },
        );
        
        const data = await response.json();
        if(!response.ok){
            throw new Error(data.error.message);
        };

        newPassword = encrypt(newPassword);

        const userInFireBase = await firebaseAdmin.admin.auth().getUserByEmail(data.email);
        await firebaseAdmin.admin.auth().updateUser(
            userInFireBase.uid,
            {
                password: newPassword,
            }
        );

        const userInPrisma = await prisma.users.findUnique({
            where: {
                email: data.email,
            },
        });

        await prisma.users.update({
            where: {
                id: userInPrisma.id,
            },
            data: {
                password: newPassword,
            },
        })

        return{
            message: "Password successfully changed",
        }
    } catch (error) {
        console.log(error.message);
        throw new Error(error.message);
    }
}