import prisma from "../../../prisma/prisma.client.js";

export const topupService = async (uid, amount, type) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: uid,
            },
        });

        let newAmount;
        if(type === "adding"){
            newAmount = user.currentAmount + amount;
        }else if(type === "reduce"){  
            if(user.currentAmount < amount){    
                throw new Error("Insufficient balance")
            };

            newAmount = user.currentAmount - amount;
        }else{
            throw new Error("invalid type")
        }

        await prisma.user.update({
            where: {
                id: uid
            },
            data: {
                currentAmount: newAmount,
            }
        });

        return `${type === "adding"? "Top-up" : "Reduce" } amount successful`;
    } catch (error) {
        throw new Error(error.message)
    }
};