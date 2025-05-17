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

    async editRoomTypeFacilityServices(roomTypeFacilityId, facilityId, roomTypeId, amount) {
        try {
            const updatedRoomTypeFacility = await prisma.roomTypeFacility.update({
                where: {
                    id: roomTypeFacilityId
                },
                data: {
                    facilityId: facilityId,
                    roomTypeId: roomTypeId,
                    amount: amount
                }
            });
    
            return updatedRoomTypeFacility;
        } catch (error) {
            console.error("Error updating room type facility:", error);
            throw new Error("Failed to update room type facility");
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

    async addFacilityServices(facilityName) {
        try {
            const newFacility = await prisma.facility.create({
                data: {
                    facilityName: facilityName
                }
            });
    
            return newFacility;
        } catch (error) {
            console.error("Error adding facility:", error);
            throw new Error("Failed to add facility");
        }
    },

    async editFacilityServices (facilityId, facilityName) {
        try {
            const result = await prisma.facility.update({
                where: {
                    id: facilityId
                },
                data: {
                    facilityName: facilityName
                }
            });
    
            return result;
        } catch (error) {
            console.error("Error updating facility:", error);
            throw new Error("Failed to update facility");
        }
    },

    async getFacilityService () {
        try {
            const result = await prisma.facility.findMany({
                select: {
                    id: true,
                    facilityName: true
                }
            });
    
            return result;
        } catch (error) {
            console.error("Error fetching facilities:", error);
            throw new Error("Failed to fetch facilities");
        }
    }

    
}