import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getRoomType (hotelId) {
            if (!hotelId) {
                throw new Error("Hotel ID is required");
            }
    
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

        
    }