import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getRoomType(hotelId) {
    try {
        const roomtypeName = await prisma.roomType.findMany({
            where: {
                hotelId: hotelId
            },
            select: {
                typeName: true
            }
        });

        return roomtypeName;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async dataRoomTypeByIdRoomServices(roomId) {
        try {
            const roomTypeData = await prisma.room.findUnique({
            where: { id: roomId },
            select: {
                roomType: {
                select: {
                    typeName: true,
                    capacity: true,
                    price: true,
                    roomTypeFacilities: {
                    select: {
                        id: true,
                        amount: true,
                        facility: {
                        select: {
                            facilityName: true
                        }
                        }
                    }
                    }
                }
                }
            }
            });

            if (!roomTypeData) {
            throw new Error('Room not found');
            }

            return roomTypeData.roomType;
        } catch (error) {
            console.error('Error fetching room type data:', error);
            throw new Error('Failed to fetch room type data');
        }
    },

    async facilityNameByRoomIdServices(roomId) {
        try {
            const facilities = await prisma.roomTypeFacility.findMany({
            where: {
                roomTypeId: (await prisma.room.findUnique({
                where: { id: roomId },
                select: { roomTypeId: true }
                })).roomTypeId
            },
            select: {
                facility: {
                select: {
                    facilityName: true
                }
                }
            }
            });

            // Extract hanya nama fasilitas dari hasil query
            return facilities.map(f => f.facility.facilityName);
        } catch (error) {
            console.error('Error fetching facility names:', error);
            throw new Error('Failed to fetch facility names');
        }
    },

    async addRoomTypeService(hotelId, typeName, capacity, price, facilities) {
    try {
        // Transaksi dengan return data lengkap
        const newRoomType = await prisma.$transaction(async (tx) => {
        const roomType = await tx.roomType.create({
            data: {
            hotelId,
            typeName,
            capacity,
            price,
            },
        });

        if (facilities && facilities.length > 0) {
            for (const facility of facilities) {
            const existingFacility = await tx.facility.findUnique({
                where: {
                    facilityName: facility.facilityName,
                }
            })

            await tx.roomTypeFacility.create({
                data: {
                roomTypeId: roomType.id,
                facilityId: existingFacility.id,
                amount: facility.amount,
                },
            });
            }
        }

        const completeRoomType = await tx.roomType.findUnique({
            where: {
                id: roomType.id,
            },
            include: {
                roomTypeFacilities: {
                    include: {
                        facility: {
                            select: {
                                facilityName: true,
                            },
                        },
                    },
                },
            },
        });

        return completeRoomType;
        });

        return {
        id: newRoomType.id,
        typeName: newRoomType.typeName,
        capacity: newRoomType.capacity,
        price: newRoomType.price,
        facilities: newRoomType.roomTypeFacilities.map((f) => ({
            facilityName: f.facility.facilityName,
            amount: f.amount,
        })),
        };
        } catch (error) {
            throw new Error(error.message);
        }
    },     

    async editRoomType(roomTypeId, typeName, capacity, price) {
        try {
            const updatedRoomType = await prisma.roomType.update({
            where: {
                id: roomTypeId
            },
            data: {
                typeName,
                capacity,
                price
            },
            include: {
                roomTypeFacilities: {
                include: {
                    facility: {
                    select: {
                        facilityName: true
                    }
                    }
                }
                }
            }
            });

            return {
            id: updatedRoomType.id,
            typeName: updatedRoomType.typeName,
            capacity: updatedRoomType.capacity,
            price: updatedRoomType.price,
            facilities: updatedRoomType.roomTypeFacilities.map((rtf) => ({
                facilityName: rtf.facility.facilityName,
                amount: rtf.amount
            }))
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },
}
