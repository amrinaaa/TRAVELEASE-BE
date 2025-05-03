import express from "express";

import authControllers from "../controllers/auth.controllers.js";
import adminControllers from "../controllers/admin.controllers.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import mitraMiddleware from "../middlewares/mitra.middleware.js";
import userMiddleware from "../middlewares/user.middleware.js";

import flightsController from '../controllers/airport/flightsController.js';

import seatsController from "../controllers/airport/seatsController.js";

import uploadController from "../controllers/uploadsControllers.js";
import uploadMiddleware from "../middlewares/fileImage.middleware.js";
import multer from "multer";

import deleteFileController from "../controllers/deleteFileControllers.js";

import mitraControllers from "../controllers/mitra.controllers.js";
import mitraHotelController from "../controllers/mitraHotelController.js";

import userController from "../controllers/user.controller.js";

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
router.post('/admin/profile/:id', upload.single('file'), authMiddleware, adminMiddleware, uploadMiddleware, uploadController.uploadProfilebyAdmin);
router.delete('/admin/profile/:id', authMiddleware, adminMiddleware, deleteFileController.deleteProfilebyAdmin);

//route flights
// api get
router.get('/airport-city', flightsController.getCityFlight);
router.get('/airport-city/:city', flightsController.getCityFlightSpesific);
router.get('/flights', flightsController.getFlights);

//route Seat
router.get('/seats/:flightId', seatsController.getSeat);

//Mitra-Penerbangan
//perbaiki lagi penamaan path nya
router.get('/airlines', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getAirlines);
router.post('/airline', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addAirline);
router.get('/plane-type', authMiddleware, mitraControllers.getPlaneType);
router.get('/planes', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getPlanes);
router.post('/plane', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addPlane);
router.post('/seat-category', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addSeatCategory);
router.get('/seat-category', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getSeatCategory);
router.get('/seats', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getPlaneSeats);
router.post('/seat', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addSeatAvailability);
router.delete('/seat', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.deletePlaneSeat);
router.post('/mitra-penerbangan/profile', upload.single('file'), authMiddleware, mitraMiddleware.mitraPenerbangan, uploadMiddleware, uploadController.uploadProfile);
router.delete('/mitra-penerbangan/profile', authMiddleware, mitraMiddleware.mitraPenerbangan, deleteFileController.deleteProfileImage);
router.post('/airportImage/:airportId', upload.single('file'), authMiddleware, mitraMiddleware.mitraPenerbangan, uploadMiddleware, uploadController.uploadAirportImage);
router.delete('/airportImage/:id', authMiddleware, mitraMiddleware.mitraPenerbangan, deleteFileController.deleteAirportImage);


//Mitra-Hotel
router.get('/hotels', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getListHotel);
router.get('/locations', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getLocation);
router.post('/hotel', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addHotel);
router.patch('/hotel', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.editHotel);
router.delete('/hotel', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.deleteHotel);
router.get('/customers', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getCustomerList);
router.post('/mitra-hotel/profile', upload.single('file'), authMiddleware,  mitraMiddleware.mitraHotel, uploadMiddleware, uploadController.uploadProfile);
router.delete('/mitra-hotel/profile', authMiddleware,  mitraMiddleware.mitraHotel, deleteFileController.deleteProfileImage);
router.post('/hotelImage/:hotelId', upload.single('file'), authMiddleware, mitraMiddleware.mitraHotel, uploadMiddleware, uploadController.uploadHotelImage);
router.delete('/hotelImage/:id', authMiddleware, mitraMiddleware.mitraHotel, deleteFileController.deleteHotelImage);
router.post('/roomImage/:roomId', upload.single('file'), authMiddleware, mitraMiddleware.mitraHotel,uploadMiddleware, uploadController.uploadRoomImage);
router.delete('/roomImage/:id', authMiddleware, mitraMiddleware.mitraHotel, deleteFileController.deleteRoomImage);

//User
router.post('/profile', upload.single('file'), authMiddleware, userMiddleware, uploadMiddleware, uploadController.uploadProfile);
router.delete('/profile', authMiddleware, userMiddleware, deleteFileController.deleteProfileImage);
router.get('/search/flights', userController.searchFlights);


export default router;