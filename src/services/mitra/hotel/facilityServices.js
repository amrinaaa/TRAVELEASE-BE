import prisma from "../../../../prisma/prisma.client.js";

export default {
    async getRoomTypeFacilityServices(roomTypeId) {
        try {
            const result = await prisma.roomTypeFacility.findMany({
                where: {
                    roomTypeId: roomTypeId
                },            
                select: {
                    id: true,
                    amount: true,
                    facility: {
                        select: {
                            facilityName: true
                        }
                    }
                }
            });
    
            return result;
        } catch (error) {
            console.error("Error fetching room type facilities:", error);
            throw new Error("Failed to fetch room type facilities");
        }
    },

    async deleteRoomTypeFacilitiesServices(roomTypeFacilityId) {
        try {
            const deletedRoomTypeFacility = await prisma.roomTypeFacility.delete({
                where: {
                    id: roomTypeFacilityId
                }
            });
    
            return deletedRoomTypeFacility;
        } catch (error) {
            console.error("Error deleting room type facility:", error);
            throw new Error("Failed to delete room type facility");
        }
    },

    async addFacility(facilityName) {
        try {
            const facility = await prisma.facility.upsert({
            where: { facilityName: facilityName },
            update: {},
            create: {
                facilityName: facilityName
            }
            });

            return facility;
        } catch (error) {
            console.error("Error adding room type facility:", error);
            throw new Error("Failed to add room type facility");
        }
    },
}