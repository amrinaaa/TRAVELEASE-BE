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

    async addRoomService({ roomTypeId, name, files }) {

        try {
            const newRoom = await prisma.room.create({
                data: {
                    name,
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

    async editRoomService({ roomId, name, files }) {
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
    }
}