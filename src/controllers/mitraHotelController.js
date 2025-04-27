import mitraHotelService from "../services/mitra/mitra.hotel.js";

export default {
    async getListHotel(req, res) {
        /**
         #swagger.tags = ['Mitra Hotel']
         #swagger.security = [{
            "bearerAuth": []
         }]
         */
        const id = res.locals.payload.id;
        try {
            const result = await mitraHotelService.getListHotelService(id);
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

    async getLocation(req, res) {
        /**
         #swagger.tags = ['Mitra Hotel']
         #swagger.security = [{
            "bearerAuth": []
         }]
         */
        try {
            const result = await mitraHotelService.getLocationService();
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
        const { locationId,name, description, address, contact } = req.body;

        try {
            const result = await mitraHotelService.addHotelService(mitraId, locationId, name, description, address, contact);
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
        const mitraId = res.locals.payload.id;
        const { hotelId, locationId, name, description, address, contact } = req.body;

        const updateData = {
            ...(locationId && { locationId }),
            ...(name && { name }),
            ...(description && { description }),
            ...(address && { address }),
            ...(contact && { contact }),
        };

        try {
            const result = await mitraHotelService.editHotelService(hotelId, mitraId, updateData);
            res.status(200).json({
                message: "Hotel updated successfully",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },

    async deleteHotel(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const mitraId = res.locals.payload.id;
        const { hotelId } = req.body;
    
        try {

            const result = await mitraHotelService.deleteHotelService(hotelId, mitraId);
            
            res.status(200).json({
                message: result.message,
                data: null,
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                data: null,
            });
        }
    },
    
    async deleteHotel(req, res) {
        /**
        #swagger.tags = ['Mitra Hotel']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
        const mitraId = res.locals.payload.id;
        const { hotelId } = req.body;
    
        try {
            const result = await mitraHotelService.deleteHotelService(hotelId, mitraId);
            
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
                
                const customers = await mitraHotelService.getCustomerListService(mitraId);

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
            }
};
