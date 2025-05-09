import hotelServices from "../services/mitra/hotel/hotelServices.js";
import customerServices from "../services/mitra/hotel/customerServices.js";
import roomServices from "../services/mitra/hotel/roomServices.js";
import roomTypeServices from "../services/mitra/hotel/roomTypeServices.js";
import facilityServices from "../services/mitra/hotel/facilityServices.js";
import validation from "../utils/validation/hotel.js"
import { validateImage } from "../utils/validation/fileImage.js"

export default {
    async getListHotel(_req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        const id = res.locals.payload.id;
        try {
            const result = await hotelServices.getListHotelService(id);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async getLocation(_req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const result = await hotelServices.getLocationService();
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async addLocation(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        const { city } = req.body;
        try {
            await validation.validateAddLocation(req.body);

            const result = await hotelServices.addLocationService(city);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async addHotel(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        const mitraId = res.locals.payload.id;
        const { locationId, name, description, address, contact } = req.body;
        const files = req.files;

        try {
            await validation.validateAddHotel(req.body);

            for (const file of files) {
                const result = validateImage(file);
                if (!result.valid) {
                    const error = new Error(result.message);
                    error.statusCode = 400;
                    throw error;
                }
            }

            const result = await hotelServices.addHotelService(mitraId, locationId, name, description, address, contact, files);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async editHotel(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { hotelId } = req.body;
        const files = req.files;

        try {
            await validation.validateEditHotel(req.body);

            const updateData = {};
            const fields = ['locationId', 'name', 'description', 'address', 'contact'];

            for (const field of fields) {
                if (field in req.body) {
                    updateData[field] = req.body[field];
                }
            }

            for (const file of files) {
                const result = validateImage(file);
                if (!result.valid) {
                    const error = new Error(result.message);
                    error.statusCode = 400;
                    throw error;
                }
            }

            const result = await hotelServices.editHotelService({
                hotelId, 
                updateData, 
                files});

            res.status(200).json({
                message: "Hotel updated successfully",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async deleteHotel(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.requestBody = {
            required: true,
            schema: {$ref: "#/components/schemas/deleteHotelRequest"}
        },
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const mitraId = res.locals.payload.id;
        const { hotelId } = req.body;

        try {
            const result = await hotelServices.deleteHotelService(hotelId, mitraId);

            res.status(200).json({
                message: result.message,
                data: null,
            });

        } catch (error) {
            res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async getCustomerList(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        try {
            const mitraId = res.locals.payload.id;
            const customers = await customerServices.getCustomerListService(mitraId);

            return res.status(200).json({
                success: true,
                message: 'List customers fetched successfully',
                data: customers,
            });

        } catch (error) {
            console.error('Error fetching customer list:', error);
            return res.status(500).json({
                success: false,
                message: 'Something went wrong while fetching customers',
                error: error.message,
            });
        }
    },

    async getRoomList(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { hotelId } = req.params;

        try {
            const result = await roomServices.getListRoomService(hotelId);

            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async getRoomType(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { hotelId } = req.params;

        try {
            const result = await roomTypeServices.getRoomType(hotelId);

            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async addRoom(req, res) {
        const { roomTypeId, name } = req.body;
        const files = req.files;

        try {
            await validation.validateAddRoom(req.body);

            for (const file of files) {
                const result = validateImage(file);
                if (!result.valid) {
                    const error = new Error(result.message);
                    error.statusCode = 400;
                    throw error;
                }
            }

            const result = await roomServices.addRoomService({
                roomTypeId,
                name,
                files
            });

            return res.status(200).json({
                message: "Room successfully added",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }

    },

    async editRoom(req, res) {
        const { roomId, name } = req.body;
        const files = req.files;

        try {
            await validation.validateEditRoom(req.body);

            for (const file of files) {
                const result = validateImage(file);
                if (!result.valid) {
                    const error = new Error(result.message);
                    error.statusCode = 400;
                    throw error;
                }
            }

            const result = await roomServices.editRoomService({
                roomId,
                name,
                files
            });

            return res.status(200).json({
                message: "Room successfully updated",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }        
    },

    async deleteRoom(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomId } = req.params;

        try {
            const result = await roomServices.deleteRoomService({ roomId });
            return res.status(200).json({
                message: "Deleted successfully",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message || "Failed to delete room",
                data: null,
            });
        }
    },

    async getRoomTypeFacility(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel]
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        const { roomTypeId } = req.params;
        if (!roomTypeId) {
            return res.status(400).json({
                message: "Room Type ID is required",
                data: null,
            });
        }

        try {
            const result = await facilityServices.getRoomTypeFacilityServices(roomTypeId);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            })
        }
    },

    async addRoomType(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
            }]
        */
        const { hotelId, typeName, capacity, price } = req.body;

        try {
            await validation.validateAddRoomType(req.body);

            const result = await roomTypeServices.addRoomType(hotelId, typeName, capacity, price);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async addRoomTypeFacility(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomTypeId, facilityId, amount } = req.body;

        try {
            await validation.validateAddRoomTypeFacility(req.body);

            const result = await facilityServices.addRoomTypeFacilityServices(roomTypeId, facilityId, amount);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async addFacility(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { name } = req.body;

        try {
            await validation.validateAddFacility(req.body);

            const result = await facilityServices.addFacilityServices(name);
            res.status(200).json({
                message: "Success",
                data: result,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        }        
    },

    async getFacilities (req, res) {
    /**
    #swagger.tags = ['Mitra Hotel']
    #swagger.security = [{
        "bearerAuth": []
    }]
    */
        try {
            const result = await facilityServices.getFacilityService();
            res.status(200).json({
                message: "Success",
                data: result,
            });
            
        }catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            })
        }
    }
};
