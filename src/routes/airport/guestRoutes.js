import express from 'express';
import guestController from '../../controllers/airport/guestController.js';
import { validateFilterFlightDate, validateFilterFlightCity } from '../../utils/validation/filterLanding.js';

const router = express.Router();

// api get
router.get('/airport-city', guestController.getCityFlight);
router.get('/airport-city/:city', guestController.getCityFlightSpesific);
router.get('/flights', guestController.getFlights);

// api filter by
router.get('/filter-by-departure/:city', guestController.filterByDepartureAirportCity);
router.get('/filter-by-arrival/:city', guestController.filterByArrivalAirportCity);
router.get('/filter-by-airport?', validateFilterFlightCity, guestController.filterByDepartureandArrivalAirportCity);
router.get('/filter-by-date', validateFilterFlightDate, guestController.filterByDepartureOrReturnTime);
router.get('/filter-by-seatCategory/:seatCategory', guestController.filterBySeatCategory);
router.get('/filter-by-all?', validateFilterFlightDate, guestController.filterByAll);

export default router; 