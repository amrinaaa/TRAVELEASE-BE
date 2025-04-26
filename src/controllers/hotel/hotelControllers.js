import hotelServices from "../../services/hotel/hotelServices.js";

export default {
    async getHotel (req, res) {
        try {
            const hotels = await hotelServices.getHotelService();
            res.status(200).json({
                message: "Get all hotels successfully",
                data: hotels,
            });
        }
        catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getLocation (req, res) {
        try {
            const city = await hotelServices.getLocationService();
            res.status(200).json({
                message: "Get all citiy successfully",
                data: city,
            });
        }
        catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getHotelByIdLocation (req, res) {
        const {id} = req.params;
        try {
            const hotel = await hotelServices.getHotelByIdLocationService(id);
            res.status(200).json({
                message: "Get hotel by location id successfully",
                data: hotel,
            });
        }
        catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },

    async getHotelById (req, res) {
        const {id} = req.params;
        try {
            const hotel = await hotelServices.getHotelByIdService(id);
            res.status(200).json({
                message: "Get hotel by id successfully",
                data: hotel,
            });
        }
        catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    }
};