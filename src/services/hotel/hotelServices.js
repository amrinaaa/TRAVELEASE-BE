import prisma from "../../../prisma/prisma.client.js";

export default {
    async getHotelService () {
    try {
        const hotels = await prisma.hotel.findMany({
            select:{
                id: true,
                name: true,
                description: true,
                contact: true,
                address: true,
                location: true,
                hotelImages: true,
            }
        }); 

        return hotels;
        } catch (error) {
            console.error("Error fetching hotels:", error);
            throw new Error("Failed to fetch hotels");
        }
    },

    async getHotelByIdService (id) {
        if (!id) {
            throw new Error("Hotel ID is required");
        }
        try {
        const hotel = await prisma.hotel.findUnique({
            where: { id },
            include: {
                location: true,
                hotelImages: true,
            }
        }); 
        return hotel;
        } catch (error) {
            console.error("Error fetching hotel:", error);
            throw new Error("Failed to fetch hotel");
        }
    }
};
