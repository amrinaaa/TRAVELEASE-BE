import flightsService from '../../services/airport/flights.js';

export default {
    async getFlightsByCity(req, res) {
        /**
        #swagger.tags = ['User-Guest']
        #swagger.parameters['city'] = {
            in: 'query',
            required: true,
            schema: {
                $ref: "#/components/schemas/GetFlightsByCityRequest"
            }
        },
        #swagger.security = [{
            "bearerAuth": []
         }]
        */
        const city = req.query.city;
        try {
            const result = await flightsService.getFlightsByCityService(city);
            res.status(200).json({
                message: "Success",
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },

    async getFlights(req, res) {
        /**
        #swagger.tags = ['User-Guest']
        */
        try {
            const flights = await flightsService.getFlightsService();
            if (!flights || flights.length === 0) {
                return res.status(404).json({
                    message: "Flights not found",
                    data: null,
                });
            }
            res.status(200).json({
                message: "Success",
                data: flights,
            });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    }
};    