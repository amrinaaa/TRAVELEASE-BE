import express from "express";

import authControllers from "../controllers/auth.controllers.js";
import adminControllers from "../controllers/admin.controllers.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

import flightsController from '../controllers/airport/flightsController.js';
import { validateFilterFlightCity, validateFilterFlightSeat, validateFilterFlightDate } from '../utils/validation/filterLanding.js';

import seatsController from "../controllers/airport/seatsController.js";

import uploadController from "../controllers/uploadsControllers.js";
import uploadMiddleware from "../middlewares/fileImage.middleware.js";
import multer from "multer";

import deleteFileController from "../controllers/deleteFileControllers.js";

import hotelControllers from "../controllers/hotel/hotelControllers.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//router auth
router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.delete("/logout", authMiddleware, authControllers.logout);
router.post("/forgot-password", authControllers.forgotPassword);
router.post("/reset-password", authControllers.resetPassword);

//route admin
router.post("/partner", authMiddleware, adminMiddleware, adminControllers.addMitra);
router.get("/partners", authMiddleware, adminMiddleware, adminControllers.getAllMitra);
router.get("/partner", authMiddleware, adminMiddleware, adminControllers.searchMitra);
router.post("/user", authMiddleware, adminMiddleware, adminControllers.addUser);
router.get("/users", authMiddleware, adminMiddleware, adminControllers.getUsers);
router.get("/user", authMiddleware, adminMiddleware, adminControllers.searchUser);
router.patch("/user", authMiddleware, adminMiddleware, adminControllers.editUser);
router.delete("/user", authMiddleware, adminMiddleware, adminControllers.deleteUser);
router.put("/amount", authMiddleware, adminMiddleware, adminControllers.topup);

//route flights
// api get
router.get('/airport-city', flightsController.getCityFlight);
router.get('/airport-city/:city', flightsController.getCityFlightSpesific);
router.get('/flights', flightsController.getFlights);
// api filter
router.get('/filter-by-all?', validateFilterFlightCity, validateFilterFlightSeat, validateFilterFlightDate, flightsController.filterByAll);

//route Seat
router.get('/seats/:flightId', seatsController.getSeat);

// Upload Route
router.post('/profileImage', upload.single('file'), authMiddleware, uploadMiddleware, uploadController.uploadProfile);
router.post('/hotelImage/:hotelId', upload.single('file'), authMiddleware, uploadMiddleware, uploadController.uploadHotelImage);
router.post('/roomImage/:roomId', upload.single('file'), authMiddleware, uploadMiddleware, uploadController.uploadRoomImage);
router.post('/airportImage/:airportId', upload.single('file'), authMiddleware, uploadMiddleware, uploadController.uploadAirportImage);

// Delete File Image
router.delete('/profileImage', authMiddleware, deleteFileController.deleteProfileImage);
router.delete('/hotelImage/:id', authMiddleware, deleteFileController.deleteHotelImage);
router.delete('/roomImage/:id', authMiddleware, deleteFileController.deleteRoomImage);
router.delete('/airportImage/:id', authMiddleware, deleteFileController.deleteAirportImage);

// Hotels
router.get('/hotels', hotelControllers.getHotel);
router.get('/hotel/:hotelId', hotelControllers.getHotelById);
// router.get('/hotel/:hotelId/rooms?', hotelControllers.getAvailableRoom);

export default router;