import flightsService from '../../services/airport/flights.js';

export default {
    async getCityFlight (req, res) {
    /**
    #swagger.tags = ['Flight']
    */
    try {
        const daerah = await flightsService.getCityFlightService();
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
        #swagger.tags = ['Flight']
        #swagger.parameters['city'] = {
            in: 'path',
            required: true,
            type: 'string',
        }
        */
        try {
            const { city } = req.params;
            const daerah = await flightsService.getCityFlightService(city);
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
        #swagger.tags = ['Flight']
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
    },

    async filterFlights(req, res) {
        try {
            const filters = req.query;
            const flights = await flightsService.filterFlights(filters);
        
            res.status(200).json({
                success: true,
                message: "Flights retrieved successfully",
                data: flights,
                });
            } catch (error) {
                res.status(500).json({
                success: false,
                message: error.message,
                });
            }
    },
    // async filterByAll (req, res) {
    //     /**
    //     #swagger.tags = ['Flight']
    //     #swagger.parameters['departureCity', 'arrivalCity', 'departureDate', 'returnDate', 'seatCategory'] = {
    //         in: 'query',
    //         required: true,
    //         schema: {
    //             $ref: "#/components/schemas/FilterFLightRequest"
    //         }
    //     }
    //     */
    //     try {
    //         const filters = req.query; 
    //         const flights = await flightsService.filterFlightsByAllService(filters);
    
    //         res.status(200).json({
    //             success: true,
    //             message: "Flights fetched successfully",
    //             data: flights
    //         });
    //     } catch (error) {
    //         res.status(500).json({
    //             success: false,
    //             message: error.message
    //         });
    //     }
    // }
};    