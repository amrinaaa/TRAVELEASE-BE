import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getRoomType(hotelId) {
            try {
                const typeRoom = await prisma.roomType.findMany({
                    where: {
                        hotelId: hotelId
                    }
                });
    
                return typeRoom;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        async addRoomType(hotelId, typeName, capacity, price) {
        try {
            const newRoomType = await prisma.roomType.create({
                data: {
                    hotelId,
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
                id: newRoomType.id,
                typeName: newRoomType.typeName,
                capacity: newRoomType.capacity,
                price: newRoomType.price,
                facilities: newRoomType.roomTypeFacilities.map(facilityEntry => ({
                    facilityName: facilityEntry.facility.facilityName,
                    amount: facilityEntry.amount
                }))
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
