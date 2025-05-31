import seatService from "../../services/airport/seat.js";

export default {
    async getSeat(req, res) {
        /**
        #swagger.tags = ['User-Login']
        #swagger.parameters['flightId'] = {
            in: 'path',
            required: true,
            type: 'string'
        }
        */
        const { flightId } = req.params;
        try {
            const result = await seatService.getSeatService(flightId);
            res.status(200).json({
                data: result,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
                data: null,
            });
        };
    },
};