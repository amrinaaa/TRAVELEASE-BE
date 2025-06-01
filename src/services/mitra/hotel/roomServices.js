import prisma from "../../../../prisma/prisma.client.js";
import fotoRoom from "../../upload/uploadsService.js";
import deleteFile from "../../deleteFileService.js";
import { extractFilePath } from "../../deleteFileService.js";

export default {
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

    async addRoomService({ name, description, roomTypeId, files }) {

        try {
            const newRoom = await prisma.room.create({
                data: {
                    name,
                    description,
                    roomTypeId,
                },
            });
    
            await Promise.all(
                files.map(file => fotoRoom.uploadRoomImage(file, newRoom.id))
            );
    
            return newRoom;
        } catch (error) {
            console.error("Error adding room:", error);
            throw new Error("Failed to add room");
        }
    },

    async dataRoomByIdServices(roomId) {
        try {
            const dataRoom = await prisma.room.findUnique({
                where: { id: roomId },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    roomImages: {
                        select: {
                            urlImage: true
                        }
                    },
                    roomType: {
                        select: {
                            typeName: true, 
                            hotel: {
                                select: {
                                    address: true,
                                    contact: true,
                                    location: {
                                        select: {
                                            city: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return {
                idRoom: dataRoom.id,
                name: dataRoom.name,
                description: dataRoom.description,
                roomTypeName: dataRoom.roomType.typeName,  // Tambahan
                address: dataRoom.roomType.hotel.address,
                contact: dataRoom.roomType.hotel.contact,
                location: dataRoom.roomType.hotel.location.city,
                roomImages: dataRoom.roomImages
            };
        } catch (error) {
            console.error("Error fetching room data:", error);
            throw new Error("Failed to fetch room data");
        }
    },

    async editRoomService({ roomId, name, description, files }) {
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { roomType: true },
            });
    
            if (!room) {
                throw new Error("Room not found");
            }
    
            const updatedRoom = await prisma.room.update({
                where: { id: roomId },
                data: {
                    name,
                    description,
                },
            });

            await Promise.all(
                files.map(file => fotoRoom.uploadRoomImage(file, updatedRoom.id))
            );
    
            return updatedRoom;
        } catch (error) {
            console.error("Error editing room:", error);
            throw new Error("Failed to edit room");
        }
    },

    async deleteRoomService(roomId) {
        try {
            let deletedRoom;
            
            await prisma.$transaction(async (prisma) => {
                // Ambil data room beserta relasinya sebelum dihapus
                deletedRoom = await prisma.room.findUnique({
                    where: { id: roomId },
                    include: {
                        roomType: {
                            include: {
                                hotel: {
                                    include: {
                                        location: true
                                    }
                                }
                            }
                        }
                    }
                });

                if (!deletedRoom) {
                    throw new Error('Room not found');
                }

                // Hapus relasi RoomImages
                await prisma.roomImage.deleteMany({
                    where: { roomId: roomId }
                });

                // Hapus relasi RoomReservations
                await prisma.roomReservation.deleteMany({
                    where: { roomId: roomId }
                });

                // Hapus room itu sendiri
                await prisma.room.delete({
                    where: { id: roomId }
                });
            });

            return deletedRoom;
        } catch (error) {
            throw new Error(`Failed to delete room: ${error.message}`);
        }
    },
}