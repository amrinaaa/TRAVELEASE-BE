import express from 'express';
import guestController from '../../controllers/airport/guestController.js';
import { validateFilterFlightCity, validateFilterFlightSeat, validateFilterFlightDate } from '../../utils/validation/filterLanding.js';

const router = express.Router();

// api get
router.get('/airport-city', guestController.getCityFlight);
router.get('/airport-city/:city', guestController.getCityFlightSpesific);
router.get('/flights', guestController.getFlights);

// api filter
router.get('/filter-by-all?', validateFilterFlightCity, validateFilterFlightSeat, validateFilterFlightDate, guestController.filterByAll);

export default router; 