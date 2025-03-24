import guestService from '../../services/airport/guestService.js';

export default {
    async getCityFlight (req, res) {
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

    async searchByDepartureAirportCity (req, res) {
        try {
            const { city } = req.params;
            const flights = await guestService.searchByDepartureAirportCityService(city);
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

    async searchByArrivalAirportCity (req, res) {
        try {
            const { city } = req.params;
            const flights = await guestService.searchByArrivalAirportCityService(city);
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

    async searchByDepartureandArrivalAirportCity (req, res) {
        try {
            const { departureCity, arrivalCity } = req.query;
            const flights = await guestService.searchByDepartureAndArrivalAirportCityService(departureCity, arrivalCity);
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

    async searchByDepartureOrReturnTime (req, res) {
        try {
            const { departureDate, returnDate } = req.query;
    
            if (!departureDate && !returnDate) {
                return res.status(400).json({
                    message: "At least one of departureDate or returnDate is required.",
                    data: null,
                });
            }

            const departureDateObj = departureDate ? new Date(departureDate) : null;
            const returnDateObj = returnDate ? new Date(returnDate) : null;
            const flights = await guestService.searchFlightsByDepartureOrReturnTimeService(departureDateObj, returnDateObj);
    
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

    async searchBySeatCategory (req, res) {
        try {
            const { seatCategory } = req.params;
            const flights = await guestService.searchFlightsBySeatCategoryService(seatCategory);
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

    async searchByAll (req, res) {
        try {
            const filters = req.query; 
            const flights = await guestService.searchFlightsByAllService(filters);
    
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