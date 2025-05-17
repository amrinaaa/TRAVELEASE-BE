import bookingServices from '../services/user/bookingServices.js';
import searchService from '../services/user/searchService.js';

export default {
    async searchFlights(req, res) {
        try {
            const flights = await searchService.filterFlights(req.query);
            if (flights.length === 0) {
                return res.status(404).json({ 
                    message: 'No flights found' 
                });
            }

            res.status(200).json({
                message: "Success", 
                data: flights,
            });

            } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Internal server error',
                data: null,
                });
            }
        },

    async bookingRoom(req, res) {
        try {
            const { roomId, startDate, endDate } = req.body;
            const userId = req.user.id;

            const result = await bookingServices.bookingRoomServices({
            userId,
            roomId,
            startDate,
            endDate,
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        
        }
    }
};