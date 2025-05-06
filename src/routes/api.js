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
import multer from "multer";

import deleteFileController from "../controllers/deleteFileControllers.js";

import mitraControllers from "../controllers/mitra.penerbangan.controllers.js";
import mitraHotelController from "../controllers/mitraHotelController.js";

import userController from "../controllers/user.controller.js";

import { getAirports } from "../controllers/airport/airportController.js";

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
router.post('/admin/profile/:id', upload.single('file'), authMiddleware, adminMiddleware, uploadController.uploadProfilebyAdmin);
router.delete('/admin/profile/:id', authMiddleware, adminMiddleware, deleteFileController.deleteProfilebyAdmin);

//route flights
// api get
router.get('/airport-city', flightsController.getCityFlight);
router.get('/airport-city/:city', flightsController.getCityFlightSpesific);
router.get('/flights', flightsController.getFlights);

//route Seat
router.get('/seats/:flightId', seatsController.getSeat);

//route airport
router.get('/airports', authMiddleware, getAirports);

//Mitra-Penerbangan
router.get('/airlines', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getAirlines);
router.post('/airline', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addAirline);
router.put('/airline', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.updateAirline);
router.delete('/airline', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.deleteAirline);
router.get('/plane-type', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getPlaneType);
router.post('/plane-type', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addPlaneType);
router.get('/planes', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getPlanes);
router.post('/plane', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addPlane);
router.delete('/plane', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.deletePlane);
// router.post('/seat-category', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addSeatCategory);
router.get('/seat-category', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getSeatCategory);
router.get('/seats', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getPlaneSeats);
router.post('/seat', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addPlaneSeat); //di cek nnti
router.delete('/seat', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.deletePlaneSeat);
router.post('/flight', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.addFlight);
router.get('/passengers', authMiddleware, mitraMiddleware.mitraPenerbangan, mitraControllers.getPassengers);
router.post('/mitra-penerbangan/profile', upload.single('file'), authMiddleware, mitraMiddleware.mitraPenerbangan, uploadController.uploadProfile);
router.delete('/mitra-penerbangan/profile', authMiddleware, mitraMiddleware.mitraPenerbangan, deleteFileController.deleteProfileImage);
router.post('/airportImage/:airportId', upload.single('file'), authMiddleware, mitraMiddleware.mitraPenerbangan, uploadController.uploadAirportImage);// blm fiks
router.delete('/airportImage/:id', authMiddleware, mitraMiddleware.mitraPenerbangan, deleteFileController.deleteAirportImage);


//Mitra-Hotel
router.get('/hotels', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getListHotel);
router.get('/locations', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getLocation);
router.post('/location', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addLocation);
router.post('/hotel', upload.array("files", 10), authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addHotel);
router.patch('/hotel', upload.array("files", 10), authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.editHotel);
router.delete('/hotel', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.deleteHotel);
router.delete('/hotelImage/:id', authMiddleware, mitraMiddleware.mitraHotel, deleteFileController.deleteHotelImage);
router.get('/customers', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getCustomerList);
router.get('/rooms/:hotelId', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getRoomList);
router.get('/roomType/:hotelId', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getRoomType);
router.post('/roomType', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addRoomType);
router.post('/room', upload.array("files", 10), authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addRoom);
router.patch('/room', upload.array("files", 10), authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.editRoom);
router.delete('/room/:roomId', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.deleteRoom);//sementara belum ngedelete sampe keika room di pesan
router.delete('/roomImage/:id', authMiddleware, mitraMiddleware.mitraHotel, deleteFileController.deleteRoomImage);
router.get('/roomType-facilities/:roomTypeId', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getRoomTypeFacility);
router.post('/roomType-facilities', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addRoomTypeFacility);
router.post('/facility', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.addFacility);
router.get('/facilities', authMiddleware, mitraMiddleware.mitraHotel, mitraHotelController.getFacilities);
//blum fiks mau disatuin ke endpoint
router.post('/mitra-hotel/profile', upload.single('file'), authMiddleware,  mitraMiddleware.mitraHotel, uploadController.uploadProfile);
router.delete('/mitra-hotel/profile', authMiddleware,  mitraMiddleware.mitraHotel, deleteFileController.deleteProfileImage);
router.post('/roomImage/:roomId', upload.single('file'), authMiddleware, mitraMiddleware.mitraHotel, uploadController.uploadRoomImage);

//User
router.post('/profile', upload.single('file'), authMiddleware, userMiddleware, uploadController.uploadProfile);
router.delete('/profile', authMiddleware, userMiddleware, deleteFileController.deleteProfileImage);
router.get('/search/flights', userController.searchFlights);

export default router;