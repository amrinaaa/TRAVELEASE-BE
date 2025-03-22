import { 
    getCityFlightService,
    getFlightsService,
    searchByDepartureAirportCityService
} from '../../services/airport/guestService.js';

export const getCityFlight = async (req, res) => {
    try {
        const daerah = await getCityFlightService();
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
}

export const getCityFlightSpesific = async (req, res) => {
    try {
        const { city } = req.params;
        const daerah = await getCityFlightService(city);
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
};

export const getFlights = async (req, res) => {
    try {
        const flights = await getFlightsService();
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
};

export const searchByDepartureAirportCity = async (req, res) => {
    try {
        const { city } = req.params;
        const flights = await searchByDepartureAirportCityService(city);
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