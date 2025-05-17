import prisma from "../../../../prisma/prisma.client.js";
import fotoHotel from "../../upload/uploadsService.js";
import deleteFile from "../../deleteFileService.js";
import { extractFilePath } from "../../deleteFileService.js"

export default {
    async getListHotelService(mitraId) {
        try {
            const hotels = await prisma.hotel.findMany({
                where: {
                    hotelPartners: {
                        some: {
                            partnerId: mitraId,
                        }
                    }
                },               
                select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                    location: {
                        select: {
                            city: true
                        }
                    }
                }
            });

            return hotels;

        } catch (error) {
                console.error("Error fetching hotels:", error);
                throw new Error("Failed to fetch hotels");
            }
        },

    async getLocationService() {
        try {
            const locations = await prisma.location.findMany({
                select: {
                    id: true,
                    city: true
                },
                orderBy: {
                    city: 'asc'
                }
            });

            return locations;

        } catch (error) {
            console.error("Error fetching locations:", error);
            throw new Error("Failed to fetch locations");
        }
    },

    async addLocationService(city) {
        try {
            const newLocation = await prisma.location.create({
                data: {
                    city
                }
            });

            return newLocation;
        } catch (error) {
            console.error("Error adding location:", error);
            throw new Error("Failed to add location");
        }
    },

    async addHotelService(mitraId, locationId, name, description, address, contact, files) {
        try {
            const newHotel = await prisma.hotel.create({
                data: {
                    locationId,
                    name,
                    description,
                    address,
                    contact,
                    hotelPartners: {
                        create: {
                            partnerId: mitraId,
                        }
                    }
                }
            });

            await Promise.all(
                files.map(file => fotoHotel.uploadHotelImage(file, newHotel.id))
            );

            return newHotel;

        } catch (error) {
                console.error("Error adding hotel:", error);
                throw new Error("Failed to add hotel");
            }
        },

    async editHotelService({hotelId, updateData, files}) {
        try {
            
            const updatedHotel = await prisma.hotel.update({
                where: { id: hotelId },
                data: updateData,
            });

            await Promise.all(
                files.map(file => fotoHotel.uploadHotelImage(file, updatedHotel.id))
            );

            return updatedHotel;

        } catch (error) {
            console.error("Error updating hotel:", error);
            throw new Error("Failed to update hotel");
        }
    },

    async deleteHotelService(hotelId, mitraId) {
        try {
            const hotel = await prisma.hotel.findUnique({
                where: { id: hotelId },
                include: {
                    hotelPartners: true,
                    hotelImages: true,
                    roomTypes: {
                        include: {
                            rooms: {
                                include: {
                                    roomReservations: {
                                        include: {
                                            reservation: {
                                                include: {
                                                    transaction: true,
                                                },
                                            },
                                        },
                                    },
                                    roomImages: true,
                                },
                            },
                        },
                    },
                },
            });
    
            if (!hotel) {
                throw new Error('Hotel not found');
            }
    
            const isMitraPartner = hotel.hotelPartners.some(
                (partner) => partner.partnerId === mitraId
            );
    
            if (!isMitraPartner) {
                throw new Error('You are not authorized to delete this hotel');
            }
    
            const reservationIds = new Set();
            const transactionIds = new Set();
    
            for (const roomType of hotel.roomTypes) {
                for (const room of roomType.rooms) {
                    for (const roomReservation of room.roomReservations) {
                        if (roomReservation.reservation) {
                            reservationIds.add(roomReservation.reservation.id);
                            if (roomReservation.reservation.transaction) {
                                transactionIds.add(roomReservation.reservation.transaction.id);
                            }
                        }
    
                        await prisma.roomReservation.delete({
                            where: { id: roomReservation.id },
                        });
                    }
    
                    for (const roomImage of room.roomImages) {
                        await prisma.roomImage.delete({
                            where: { id: roomImage.id },
                        });
                    }
                }
            }
    
            for (const roomType of hotel.roomTypes) {
                await prisma.roomTypeFacility.deleteMany({
                    where: { roomTypeId: roomType.id },
                });
            }
    
            await prisma.room.deleteMany({
                where: { roomTypeId: { in: hotel.roomTypes.map(rt => rt.id) } },
            });
    
            await prisma.roomType.deleteMany({
                where: { hotelId: hotel.id },
            });
    
            await prisma.hotelPartner.deleteMany({
                where: { partnerId: mitraId, hotelId: hotel.id },
            });

            const images = await prisma.hotelImage.findMany({
                where: { hotelId: hotel.id },
                });
                
                if (images.length === 0) {
                    throw new Error("No hotel images found");
                }

                for (const image of images) {
                    const filePath = extractFilePath(image.imageUrl);
                    await deleteFile.deleteFile(filePath);
                }

                await prisma.hotelImage.deleteMany({
                    where: { hotelId: hotel.id },
                });
    
            for (const reservationId of reservationIds) {
                await prisma.reservation.delete({
                    where: { id: reservationId },
                });
            }
            
            for (const transactionId of transactionIds) {
                await prisma.transaction.delete({
                    where: { id: transactionId },
                });
            }
    
            await prisma.hotel.delete({
                where: { id: hotelId },
            });
    
            return { message: 'Hotel and related data deleted successfully' };

        } catch (error) {
            console.error("Error deleting hotel:", error);
            throw new Error("Failed to delete hotel");
        }
    }
};
