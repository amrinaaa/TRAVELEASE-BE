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
        const { hotelId, typeName, capacity, price } = data;

        if (!hotelId) {
            const error = new Error("Hotel ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (!typeName) {
            const error = new Error("Room type name is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof typeName !== "string") {
            const error = new Error("Room type name must be a string");
            error.statusCode = 400;
            throw error;
        }

        if (capacity === undefined || capacity === null) {
            const error = new Error("Capacity is required");
            error.statusCode = 400;
            throw error;
        }

        if (isNaN(capacity) || Number(capacity) <= 0) {
            const error = new Error("Capacity must be a positive number");
            error.statusCode = 400;
            throw error;
        }

        if (price === undefined || price === null) {
            const error = new Error("Price is required");
            error.statusCode = 400;
            throw error;
        }

        if (isNaN(price) || Number(price) <= 0) {
            const error = new Error("Price must be a positive number");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateAddRoomTypeFacility(data) {
        const { roomTypeId, facilityId, amount } = data;

        if (!roomTypeId) {
            const error = new Error("Room Type ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (!facilityId) {
            const error = new Error("Facility ID is required");
            error.statusCode = 400;
            throw error;
        }

        if (amount === undefined || amount === null) {
            const error = new Error("Amount is required");
            error.statusCode = 400;
            throw error;
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            const error = new Error("Amount must be a positive number");
            error.statusCode = 400;
            throw error;
        }
    },

    async validateAddFacility(data) {
        const { name } = data;

        if (!name) {
            const error = new Error("Facility name is required");
            error.statusCode = 400;
            throw error;
        }

        if (typeof name !== 'string') {
            const error = new Error("Facility name must be a string");
            error.statusCode = 400;
            throw error;
        }
    }
};
