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

    async addRoomTypeFacilityServices(roomTypeId, facilityId, amount) {
        try {
            const newRoomTypeFacility = await prisma.roomTypeFacility.create({
                data: {
                    roomTypeId: roomTypeId,
                    facilityId: facilityId,
                    amount: amount
                }
            });
    
            return newRoomTypeFacility;
        } catch (error) {
            console.error("Error adding room type facility:", error);
            throw new Error("Failed to add room type facility");
        }
    },

    async addFacilityServices(name) {
        try {
            const newFacility = await prisma.facility.create({
                data: {
                    facilityName: name
                }
            });
    
            return newFacility;
        } catch (error) {
            console.error("Error adding facility:", error);
            throw new Error("Failed to add facility");
        }
    }

    
}