export default {
    async validateAddLocation(data) {
        const { city } = data;

        if (!city) {
            const error = new Error("Location city is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof city !== 'string') {
            const error = new Error("Location city must be a string");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateAddHotel(data) {
        const { locationId, name, description, address, contact } = data;

        if (!locationId) {
            const error = new Error("Location ID is required");
            error.statusCode = 400;
            throw error;
        }
        
        if (!name) {
            const error = new Error("Hotel name is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof name !== 'string') {
            const error = new Error("Hotel name must be a string");
            error.statusCode = 400;
            throw error;
        }
    
        if (!description) {
            const error = new Error("Description is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof description !== 'string') {
            const error = new Error("Description must be a string");
            error.statusCode = 400;
            throw error;
        }

        if (!address) {
            const error = new Error("Address is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof address !== 'string') {
            const error = new Error("Address must be a string");
            error.statusCode = 400;
            throw error;
        }
    
        if (!contact) {
            const error = new Error("Contact is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof contact !== 'string') {
            const error = new Error("Contact must be a string");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateEditHotel(data) {
        const { hotelId, locationId, name, description, address, contact } = data;

        if (!hotelId) {
            const error = new Error("Hotel ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (!locationId) {
            const error = new Error("Location ID is required");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateAddRoom(data) {
        const { roomTypeId, name } = data;

        if (!roomTypeId) {
            const error = new Error("Room Type ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (!name) {
            const error = new Error("Room name is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof name !== 'string') {
            const error = new Error("Room name must be a string");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateEditRoom(data) {
        const { roomId } = data;

        if (!roomId) {
            const error = new Error("Room ID is required");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateAddRoomType(data) {
        const { hotelId, typeName, capacity, price, facilities } = data;

        if (!hotelId) {
            const error = new Error("Hotel ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof typeName !== "string" || typeName.trim() === "") {
            const error = new Error("Room type name is required and must be a non-empty string");
            error.statusCode = 400;
            throw error;
        }

        if (capacity === undefined || isNaN(capacity) || Number(capacity) <= 0) {
            const error = new Error("Capacity must be a positive number");
            error.statusCode = 400;
            throw error;
        }

        if (price === undefined || isNaN(price) || Number(price) <= 0) {
            const error = new Error("Price must be a positive number");
            error.statusCode = 400;
            throw error;
        }

        if (facilities && !Array.isArray(facilities)) {
            const error = new Error("Facilities must be an array if provided");
            error.statusCode = 400;
            throw error;
        }

        if (facilities) {
            for (const facility of facilities) {
                if (
                    typeof facility.facilityName !== "string" ||
                    facility.facilityName.trim() === ""
                ) {
                    const error = new Error("Each facility must have a valid non-empty string 'facilityName'");
                    error.statusCode = 400;
                    throw error;
                }

                if (facility.amount === undefined || isNaN(facility.amount) || Number(facility.amount) <= 0) {
                    const error = new Error("Each facility must have a valid positive number 'amount'");
                    error.statusCode = 400;
                    throw error;
                }
            }
        }
    },

    async validateAddFacility(data) {
        const { facilityName } = data;

        if (!facilityName || typeof facilityName !== "string" || facilityName.trim() === "") {
            const error = new Error("Facility Name is required and must be a non-empty string");
            error.statusCode = 400;
            throw error;
        }
    }
};
