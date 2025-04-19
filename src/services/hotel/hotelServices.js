import prisma from "../../../prisma/prisma.client.js";

export default {
    async getHotelService () {
    try {
        const hotels = await prisma.hotel.findMany({
            include: {
                location: true,
                hotelImages: true,
                hotelPartners: true,
                roomTypes: true,
            }
        }); 
        return hotels;
        } catch (error) {
            console.error("Error fetching hotels:", error);
            throw new Error("Failed to fetch hotels");
        }
    },

    async getHotelByIdService (id) {
    try {
        const hotel = await prisma.hotel.findUnique({
            where: { id },
            include: {
                location: true,
                hotelImages: true,
                hotelPartners: true,
                roomTypes: true,
            }
        }); 
        return hotel;
        } catch (error) {
            console.error("Error fetching hotel:", error);
            throw new Error("Failed to fetch hotel");
        }
    }
};
