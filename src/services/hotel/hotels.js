import prisma from "../../../prisma/prisma.client.js";

export default {
    async getHotelsService() {
        try {
            const hotels = await prisma.hotel.findMany({
                include: {
                    location: true,
                    hotelImages: true,
                },
            });

            return hotels;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async getHotelsByCityService(city) {
        try {
            const hotels = await prisma.hotel.findMany({
                where: {
                    location: {
                        city: {
                            equals: city,
                            mode: "insensitive",
                        }
                    }
                },
                include: {
                    location: true,
                    hotelImages: true,
                },
            });

            return hotels;
        } catch (error) {
            throw new Error(error.message);
        };
    },

    async searchRoomsService({
        cityOrHotel,
        checkIn,
        checkOut,
        guests,
        roomType,
    }) {
        try {
            const whereClause = {
                ...(roomType && {
                    roomType: {
                        typeName: { contains: roomType, mode: 'insensitive' },
                    },
                }),
                ...(guests && {
                    roomType: {
                        capacity: { gte: parseInt(guests) },
                    },
                }),
                ...(cityOrHotel && {
                    roomType: {
                        hotel: {
                            OR: [
                                {
                                    name: { contains: cityOrHotel, mode: 'insensitive' },
                                },
                                {
                                    location: {
                                        city: { contains: cityOrHotel, mode: 'insensitive' },
                                    },
                                },
                            ],
                        },
                    },
                }),
            };

            const rooms = await prisma.room.findMany({
                where: whereClause,
                include: {
                    roomImages: true,
                    roomType: {
                        include: {
                            hotel: {
                                include: { location: true, hotelImages: true },
                            },
                        },
                    },
                    roomReservations:
                        checkIn && checkOut
                            ? {
                                where: {
                                    reservation: {
                                        OR: [
                                            {
                                                startDate: { lte: new Date(checkOut) },
                                                endDate: { gte: new Date(checkIn) },
                                            },
                                        ],
                                    },
                                },
                            }
                            : undefined,
                },
            });

            const availableRooms =
                checkIn && checkOut
                    ? rooms.filter((room) => room.roomReservations.length === 0)
                    : rooms;

            const uniqueHotels = {};
            for (const room of availableRooms) {
                const hotel = room.roomType.hotel;
                if (!uniqueHotels[hotel.id]) {
                    uniqueHotels[hotel.id] = hotel;
                }
            }

            return Object.values(uniqueHotels);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}