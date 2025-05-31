import hotelServices from "../services/mitra/hotel/hotelServices.js";
import customerServices from "../services/mitra/hotel/customerServices.js";
import roomServices from "../services/mitra/hotel/roomServices.js";
import roomTypeServices from "../services/mitra/hotel/roomTypeServices.js";
import facilityServices from "../services/mitra/hotel/facilityServices.js";
import validation from "../utils/validation/hotel.js"
import { validateImage } from "../utils/validation/fileImage.js"
import bookingTodayService from "../services/mitra/hotel/dashboardService.js"

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

    async hotelDataById(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { hotelId } = req.params;
        try {
            const result = await hotelServices.hotelDataByIdServices(hotelId);
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
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { name, description, roomTypeId } = req.body;
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
                name,
                description,
                roomTypeId,
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

    async dataRoomById(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomId } = req.params;
        try {
            const result = await roomServices.dataRoomByIdServices(roomId);
            return res.status(200).json({
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

    async editRoom(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomId, name, description } = req.body;
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
                description,
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
        const {roomId} = req.body;
        try {
            const result = await roomServices.deleteRoomService(roomId);
            res.status(200).json({
                message: 'success',
                data: result
            });
        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message,
                data: null,
            });
        } 
    },

    async getRoomTypeFacility(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
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
    
        try {
            const { hotelId, typeName, capacity, price, facilities} = req.body;

            await validation.validateAddRoomType(req.body);

            const result = await roomTypeServices.addRoomTypeService(hotelId, typeName, capacity, price, facilities);
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

    async dataRoomTypeByIdRoom(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomId } = req.params;
        try {
            const result = await roomTypeServices.dataRoomTypeByIdRoomServices(roomId);
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

    async facilityNameByRoomId(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomId } = req.params;
        try {
            const result = await roomTypeServices.facilityNameByRoomIdServices(roomId);
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

    async editRoomType(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomTypeId, typeName, capacity, price } = req.body;

        try {
            const result = await roomTypeServices.editRoomType(roomTypeId, typeName, capacity, price);
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

    async deleteRoom(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomId } = req.params;
        try {
            await roomServices.deleteRoomService(roomId);
            res.status(200).json({
                message: "Room deleted successfully",
                data: null,
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
        try {
            const { facilityName} = req.body;

            await validation.validateAddFacility(req.body);

            const result = await facilityServices.addFacility(
            facilityName
            );

            return res.status(200).json({
            message: "Facility added successfully",
            data: result,
            });
        } catch (error) {
            console.error("Add Facility Error:", error);
            return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            data: null,
            });
        }
    },

    async deleteRoomTypeFacility(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const { roomTypeFacilityId } = req.params;

        try {
            await facilityServices.deleteRoomTypeFacilitiesServices(roomTypeFacilityId);

            return res.status(200).json({
                message: `Successfully deleted`,
            });

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                message: error.message || "Failed to delete Room Type Facility",
            });
        }
    },

    //dashboard
    async newBookingToday(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {

            const mitraId = res.locals.payload.id;
            const result = await bookingTodayService.newBookingTodayService(mitraId);

            return res.status(200).json({
            success: true,
            message: "New room bookings today retrieved successfully",
            data: result,
            });
            
        } catch (error) {
            console.error("Error in getNewBookingsToday:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to retrieve new room bookings today",
            });
        }
    },

    async availableRoom(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const mitraId = res.locals.payload.id;
            const result = await bookingTodayService.availableRoomService(mitraId);

            return res.status(200).json({
            success: true,
            message: "Available rooms today retrieved successfully",
            data: result,
            });
            
        } catch (error) {
            console.error("Error in getAvailableRoomsToday:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to retrieve available rooms today",
            });
        }
    },

    async activeBooking(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const mitraId = res.locals.payload.id;
            const result = await bookingTodayService.activeBookingRoomService(mitraId);

            return res.status(200).json({
            success: true,
            message: "Active bookings retrieved successfully",
            data: result,
            });
            
        } catch (error) {
            console.error("Error in getActiveBookings:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to retrieve active bookings",
            });
        }
    },

    async revenueReport(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const mitraId = res.locals.payload.id;
            const result = await bookingTodayService.revenueReportService(mitraId);

            return res.status(200).json({
            success: true,
            message: "Revenue report retrieved successfully",
            data: result,
            });
            
        } catch (error) {
            console.error("Error in getRevenueReport:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to retrieve revenue report",
            });
        }
    },

    async grafikRevenue(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const mitraId = res.locals.payload.id;
            const result = await bookingTodayService.grafikRevenueServices(mitraId);

            return res.status(200).json({
            success: true,
            message: "Revenue graph data retrieved successfully",
            data: result,
            });
            
        } catch (error) {
            console.error("Error in getGrafikRevenue:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to retrieve revenue graph data",
            });
        }
    },

    async grafikBooking(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
         */
        try {
            const mitraId = res.locals.payload.id;
            const result = await bookingTodayService.grafikBookingServices(mitraId);

            return res.status(200).json({
            success: true,
            message: "Booking graph data retrieved successfully",
            data: result,
            });
            
        } catch (error) {
            console.error("Error in getGrafikBooking:", error);
            return res.status(500).json({
            success: false,
            message: "Failed to retrieve booking graph data",
            });
        }
    }
};