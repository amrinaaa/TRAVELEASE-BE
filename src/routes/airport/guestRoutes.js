import express from 'express';
import {
    getCityFlight, 
    getCityFlightSpesific,
    getFlights,
    searchByDepartureAirportCity
} from '../../controllers/airport/guestController.js';

const router = express.Router();

router.get('/airport-city', getCityFlight);
router.get('/airport-city/:city', getCityFlightSpesific);
router.get('/flights', getFlights);
router.get('/search-by-departure/:city', searchByDepartureAirportCity);

export default router;