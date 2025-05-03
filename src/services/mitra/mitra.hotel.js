import prisma from "../../../prisma/prisma.client.js";
import fotoHotel from "../upload/uploadsService.js";

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
            
            if (files && files.length > 0) {
                for (const file of files) {
                    await fotoHotel.uploadHotelImage(file, newHotel.id);
                }
            }

            return newHotel;

        } catch (error) {
                console.error("Error adding hotel:", error);
                throw new Error("Failed to add hotel");
            }
        },

    async editHotelService(hotelId, mitraId, updateData, files) {
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
                throw new Error('You are not authorized to edit this hotel');
            }

            const updatedHotel = await prisma.hotel.update({
                where: { id: hotelId },
                data: updateData,
            });

            if (files && files.length > 0) {
                for (const file of files) {
                    await fotoHotel.uploadHotelImage(file, hotelId);
                }
            }

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
    },
    
    async getCustomerListService(){
        const customers = await prisma.reservation.findMany({
            select: {
                id: true,
                startDate: true,
                endDate: true,
                transaction: {
                    select: {
                    price: true,
                    user: {
                        select: {
                        name: true,
                        role: true,
                        }
                    }
                    }
                },
                roomReservations: {
                    select: {
                    room: {
                        select: {
                        id: true,
                        roomType: {
                            select: {
                            typeName: true,
                            }
                        }
                        }
                    }
                    }
                }
                },
                where: {
                transaction: {
                    user: {
                    role: 'USER',
                    }
                }
                }
            });
            
            const formatted = customers.map((reservation) => {
                return {
                idReservation: reservation.id,
                name: reservation.transaction.user.name,
                idRoom: reservation.roomReservations[0]?.room.id || null,
                roomType: reservation.roomReservations[0]?.room.roomType.typeName || null,
                startDate: reservation.startDate,
                endDate: reservation.endDate,
                price: reservation.transaction.price,
                };
            });
            
            return formatted;
        },

    async getListRoomService(hotelId) {
        try {
            const now = new Date();

            const rooms = await prisma.room.findMany({
            where: {
                roomType: {
                hotelId: hotelId
                }
            },
            include: {
                roomType: {
                select: {
                    typeName: true,
                    price: true,
                    roomTypeFacilities: {
                    select: {
                        facility: {
                        select: {
                            facilityName: true
                        }
                        }
                    }
                    }
                }
                },
                roomReservations: {
                include: {
                    reservation: {
                    include: {
                        transaction: true
                    }
                    }
                }
                },
            }
            });

            const formattedRooms = rooms.map(room => {
            const isReserved = room.roomReservations.some(rr => {
                const res = rr.reservation;
                return (
                res.transaction.status === "PAID" &&
                new Date(res.startDate) <= now &&
                new Date(res.endDate) >= now
                );
            });

            return {
                id: room.id,
                name: room.name,
                roomType: room.roomType.typeName,
                price: room.roomType.price,
                facilities: room.roomType.roomTypeFacilities.map(f => f.facility.facilityName),
                status: isReserved ? "Not Available" : "Available"
            };
            });

            return formattedRooms;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async addRoomService(hotelId, roomTypeId, name, files) {
        try {
            const newRoom = await prisma.room.create({
                data: {
                    hotelId,
                    roomTypeId,
                    name,
                }
            });

            if (files && files.length > 0) {
                for (const file of files) {
                    await fotoHotel.uploadRoomImage(file, newRoom.id);
                }
            }

            return newRoom;

        } catch (error) {
            console.error("Error adding room:", error);
            throw new Error("Failed to add room");
        }
    }


};
