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

    async hotelDataByIdServices(hotelId) {
        try { 
            const dataHotel = await prisma.hotel.findUnique({
                where: { id: hotelId },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                    contact: true,
                    location: {
                        select: {
                            city: true
                        }
                    },
                    hotelImages: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            });

            return dataHotel;
        } catch (error) {
            console.error("Error fetching hotel data:", error);
            throw new Error("Failed to fetch hotel data");
        }
    },

    async deleteHotelService(hotelId, mitraId) {
        try {
            const hotel = await prisma.hotel.findUnique({
                where: { id: hotelId },
                include: { hotelPartners: true },
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

            // Ambil semua data ID terkait dengan efisien
            const roomTypes = await prisma.roomType.findMany({
                where: { hotelId },
                select: {
                    id: true,
                    rooms: {
                        select: {
                            id: true,
                            roomImages: { select: { id: true } },
                            roomReservations: {
                                select: {
                                    id: true,
                                    reservation: {
                                        select: {
                                            id: true,
                                            transaction: { select: { id: true } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const roomTypeIds = roomTypes.map(rt => rt.id);
            const roomIds = [];
            const roomImageIds = [];
            const roomReservationIds = [];
            const reservationIds = new Set();
            const transactionIds = new Set();

            for (const rt of roomTypes) {
                for (const room of rt.rooms) {
                    roomIds.push(room.id);
                    room.roomImages.forEach(img => roomImageIds.push(img.id));
                    for (const rr of room.roomReservations) {
                        roomReservationIds.push(rr.id);
                        if (rr.reservation) {
                            reservationIds.add(rr.reservation.id);
                            if (rr.reservation.transaction) {
                                transactionIds.add(rr.reservation.transaction.id);
                            }
                        }
                    }
                }
            }

            // Ambil dan hapus file image fisik
            const hotelImages = await prisma.hotelImage.findMany({ where: { hotelId } });
            for (const image of hotelImages) {
                const filePath = extractFilePath(image.imageUrl);
                await deleteFile.deleteFile(filePath);
            }

            // Jalankan semua penghapusan dalam transaksi prisma
            await prisma.$transaction([
                prisma.roomReservation.deleteMany({ where: { id: { in: roomReservationIds } } }),
                prisma.roomImage.deleteMany({ where: { id: { in: roomImageIds } } }),
                prisma.roomTypeFacility.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } }),
                prisma.room.deleteMany({ where: { id: { in: roomIds } } }),
                prisma.roomType.deleteMany({ where: { id: { in: roomTypeIds } } }),
                prisma.hotelImage.deleteMany({ where: { hotelId } }),
                prisma.hotelPartner.deleteMany({ where: { hotelId, partnerId: mitraId } }),
                prisma.reservation.deleteMany({ where: { id: { in: Array.from(reservationIds) } } }),
                prisma.transaction.deleteMany({ where: { id: { in: Array.from(transactionIds) } } }),
                prisma.hotel.delete({ where: { id: hotelId } })
            ]);

            return { message: 'Hotel and related data deleted successfully' };
        } catch (error) {
            console.error("Error deleting hotel:", error);
            throw new Error("Failed to delete hotel");
        }
    }
};
