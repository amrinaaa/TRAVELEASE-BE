import hotelService from "../../services/hotel/hotels.js";

export default {
    async getHotels(_req, res) {
        try {
            /**
            #swagger.tags = ['User-Guest']
            #swagger.security = [{
                "bearerAuth": []
            }]
            */
            const hotels = await hotelService.getHotelsService();
            res.status(200).json({
                message: "success",
                data: hotels
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
                data: null
            });
        };
    },

    async getHotelsByCity(req, res) {
        /**
        #swagger.tags = ['User-Guest']
        #swagger.parameters['city'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetHotelsByCityRequest"
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const city = req.query.city;
        try {
            const hotels = await hotelService.getHotelsByCityService(city);
            res.status(200).json({
                message: "success",
                data: hotels
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
                data: null
            });
        };
    },

    async searchRooms(req, res) {
        /**
        #swagger.tags = ['User-Guest']
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const { cityOrHotel, checkIn, checkOut, guests, roomType } = req.query;
        try {
            if (checkIn && checkOut) {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);

                if (checkInDate > checkOutDate) {
                    return res.status(400).json({
                        message: 'Tanggal check-in tidak boleh setelah tanggal check-out.',
                        data: null
                    });
                }
            }

            const rooms = await hotelService.searchRoomsService({
                cityOrHotel,
                checkIn,
                checkOut,
                guests,
                roomType
            });

            res.status(200).json({
                message: 'success',
                data: rooms
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
                data: null
            });
        }
    },
};