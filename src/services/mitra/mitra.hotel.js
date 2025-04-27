import prisma from "../../../prisma/prisma.client.js";

export default {
    async getRoomService(hotelId) {
        try {
            const rooms = await prisma.room.findMany({
                where: {
                    hotelId: hotelId,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    roomType: {
                        select: {
                            name: true,
                        }
                    },
                    price: true,
                    isAvailable: true,
                }
            });
            return rooms;
        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw new Error("Failed to fetch rooms");
        }
    }
};
