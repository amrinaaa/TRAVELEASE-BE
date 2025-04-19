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
    },

    async getAvailableRoom (req, res) {
        const { hotelId } = req.params;
        const { checkInDate, checkOutDate } = req.query;
        try {
            const availableRooms = await hotelServices.getAvailableRoomService(hotelId, checkInDate, checkOutDate);
            res.status(200).json({
                message: "Get available rooms successfully",
                data: availableRooms,
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