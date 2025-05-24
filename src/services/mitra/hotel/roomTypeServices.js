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
