import prisma from "../../../prisma/prisma.client.js";
import {getAuth, createUserWithEmailAndPassword} from "../../../firebase/config.js";
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

// export const registerUser = async ({
//     name, email, password
// }) => {
//     try {
//         const existingUserPrisma = await prisma.user.findUnique({ where: {email} });
//         if(existingUserPrisma){
//             throw new Error("email already registered")
//         };

//         try {
//             await firebaseAdmin.admin.auth().getUserByEmail(email);
//             throw new Error("email already registered");
//         } catch (error) {
//             if (error.code !== "auth/user-not-found") {
//                 throw error;
//             }
//         };

//         password= encrypt(password);

//         const userFirebase = await firebaseAdmin.admin.auth().createUser({
//             email, password
//         });
        
//         // const verificationLink = await firebaseAdmin.admin.auth().generateEmailVerificationLink(email);

//         const userPrisma = await prisma.user.create({
//             data: {
//                 id: userFirebase.uid,
//                 name,
//                 email,
//                 password,
//                 // isVerified: false,
//             },
//         });
        
//         return { 
//             user: userPrisma, 
//             // verificationLink 
//         };

//     } catch (error) {
//        throw new Error(error.message)
//     }
// }