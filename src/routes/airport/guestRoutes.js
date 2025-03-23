import express from 'express';
import guestController from '../../controllers/airport/guestController.js';
import { validateSearchFlightDate, validateSearchFlightCity } from '../../utils/validation/filterLanding.js';

const router = express.Router();

// api get
router.get('/airport-city', guestController.getCityFlight);
router.get('/airport-city/:city', guestController.getCityFlightSpesific);
router.get('/flights', guestController.getFlights);

// api filter by
router.get('/search-by-departure/:city', guestController.searchByDepartureAirportCity);
router.get('/search-by-arrival/:city', guestController.searchByArrivalAirportCity);
router.get('/search-by-airport?', validateSearchFlightCity, guestController.searchByDepartureandArrivalAirportCity);
router.get('/search-by-date', validateSearchFlightDate, guestController.searchByDepartureOrReturnTime);
router.get('/search-by-seatCategory/:seatCategory', guestController.searchBySeatCategory);
router.get('/search-by-all?', validateSearchFlightDate, guestController.searchByAll);

export default router; 