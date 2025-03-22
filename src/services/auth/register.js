import prisma from "../../../prisma/prisma.client.js";

import {
    getAuth, 
    createUserWithEmailAndPassword,
} from "../../../firebase/config.js";

import { encrypt } from "../../utils/encrypt.js";

export const registerUser = async ({ name, email, password }) => {
    try {
        const existingUserPrisma = await prisma.user.findUnique({ where: { email } });
        if (existingUserPrisma) {
            throw new Error("Email already registered");
        }

        const auth = getAuth();
        let userCredential;
        
        try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                throw new Error("Email already registered");
            }
            throw new Error(error.message);
        }

        const uid = userCredential.user.uid;
        const hashedPassword = encrypt(password);

        const createdUser = await prisma.user.create({
            data: {
                id: uid,
                name,
                email,
                password: hashedPassword,
            },
        });

        return { user: createdUser };
    } catch (error) {
        throw new Error(error.message);
    }
};