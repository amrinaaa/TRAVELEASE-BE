import guestService from '../../services/airport/guestService.js';

export default {
    async getCityFlight (req, res) {
    /**
    #swagger.tags = ['Guest']
    */
    try {
        const daerah = await guestService.getCityFlightService();
        if (!daerah || daerah.length === 0) {
            return res.status(404).json({
                message: "City not found",
                data: null,
            });
        }
        res.status(200).json({
            message: "Success",
            data: daerah,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            data: null,
        });
    }
},

    async getCityFlightSpesific (req, res) {
    /**
    #swagger.tags = ['Guest']
    #swagger.parameters['city'] = {
        in: 'path',
        required: true,
        schema: {
            type: 'string',
            example: 'Jakarta'
        }
    }
    */
        try {
            const { city } = req.params;
            const daerah = await guestService.getCityFlightService(city);
            if (!daerah || daerah.length === 0) {
                return res.status(404).json({
                    message: "City not found",
                    data: null,
                });
            }
            res.status(200).json({
                message: "Success",
                data: daerah,
            });
            
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({
                message: "Internal Server Error",
                data: null,
            });
        }
    },

    async getFlights (req, res) {
    /**
    #swagger.tags = ['Guest']
    */
        try {
            const flights = await guestService.getFlightsService();
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
    },
    /**
    #swagger.tags = ['Guest']
    #swagger.parameters['departureCity', 'arrivalCity', 'departureDate', 'returnDate', 'seatCategory'] = {
        in: 'query',
        required: true,
        schema: {
            $ref: "#/components/schemas/FilterFLightRequest"
        }
    }
    */
    async filterByAll (req, res) {
    
        try {
            const filters = req.query; 
            const flights = await guestService.filterFlightsByAllService(filters);
    
            res.status(200).json({
                success: true,
                message: "Flights fetched successfully",
                data: flights
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};    