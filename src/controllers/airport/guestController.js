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

    async filterByDepartureAirportCity (req, res) {
        try {
            const { city } = req.params;
            const flights = await guestService.filterByDepartureAirportCityService(city);
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

    async filterByArrivalAirportCity (req, res) {
        try {
            const { city } = req.params;
            const flights = await guestService.filterByArrivalAirportCityService(city);
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

    async filterByDepartureandArrivalAirportCity (req, res) {
        try {
            const { departureCity, arrivalCity } = req.query;
            const flights = await guestService.filterByDepartureAndArrivalAirportCityService(departureCity, arrivalCity);
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

    async filterByDepartureOrReturnTime (req, res) {
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
            const flights = await guestService.filterFlightsByDepartureOrReturnTimeService(departureDateObj, returnDateObj);
    
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

    async filterBySeatCategory (req, res) {
        try {
            const { seatCategory } = req.params;
            const flights = await guestService.filterFlightsBySeatCategoryService(seatCategory);
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