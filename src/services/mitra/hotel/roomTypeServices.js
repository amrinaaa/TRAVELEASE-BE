import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getRoomType(hotelId) {
            try {
                const typeRoom = await prisma.roomType.findMany({
                    where: {
                        hotelId: hotelId
                    }
                });
    
                return typeRoom;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        async addRoomType(hotelId, typeName, capacity, price) {
            try {
                const newRoomType = await prisma.roomType.create({
                    data: {
                        hotelId,
                        typeName,
                        capacity,
                        price
                    }
                });
        
                return newRoomType;
            } catch (error) {
                throw new Error(error.message);
            }
        },        
}
