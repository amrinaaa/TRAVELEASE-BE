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
        
        async editRoomType(roomTypeId, typeName, capacity, price) {
            try {
                const updatedRoomType = await prisma.roomType.update({
                    where: {
                        id: roomTypeId
                    },
                    data: {
                        typeName,
                        capacity,
                        price
                    }
                });
        
                return updatedRoomType;
            } catch (error) {
                throw new Error(error.message);
            }
        }
}
