import prisma from "../../../prisma/prisma.client.js";
// import firebaseAdmin from "../../../firebase/config.js";

export const searchUserService = async ({identifier, role}) => {
    try {
        //buat memastikan bahwa user ada di firebase dan db
        //kalau dibuat bisa filter menggunakan nama atau email maka tidak bisa cek di firebase
        // const identifierFirebase = await firebaseAdmin.admin.auth().getUserByEmail(email);

        const result = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        name: identifier,
                    },
                    {
                        email: identifier,
                    }
                ],
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                currentAmount: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return result
    } catch (error) {
        throw new Error(error.message);
    };
};