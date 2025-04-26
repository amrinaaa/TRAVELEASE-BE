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
    
            // Periksa apakah tidak ada penerbangan keberangkatan dan penerbangan pulang
            if (
                !flights ||
                (flights.departureFlights.length === 0 && flights.returnFlights.length === 0)
            ) {
                return res.status(404).json({
                    message: "Flights not found",
                    data: null,
                });
            }
    
            // Periksa jika hanya tidak ada penerbangan keberangkatan
            if (flights.departureFlights.length === 0) {
                return res.status(404).json({
                    message: "No departure flights available",
                    data: flights.returnFlights,
                });
            }
    
            // Periksa jika hanya tidak ada penerbangan pulang
            if (flights.returnFlights.length === 0) {
                return res.status(404).json({
                    message: "No return flights available",
                    data: flights.departureFlights,
                });
            }
    
            // Jika ada penerbangan, kembalikan hasil
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