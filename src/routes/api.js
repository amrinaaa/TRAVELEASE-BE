import express from "express";

import authControllers from "../controllers/auth.controllers.js";
import adminControllers from "../controllers/admin.controllers.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

import guestController from '../controllers/airport/guestController.js';
import { validateFilterFlightCity, validateFilterFlightSeat, validateFilterFlightDate } from '../utils/validation/filterLanding.js';

import { uploadFile } from "../controllers/uploadControllers.js";
import multer from "multer";

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
router.delete("/user", authMiddleware, adminMiddleware, adminControllers.deleteUser);
router.put("/user", authMiddleware, adminMiddleware, adminControllers.topup);

//route guest
// api get
router.get('/airport-city', guestController.getCityFlight);
router.get('/airport-city/:city', guestController.getCityFlightSpesific);
router.get('/flights', guestController.getFlights);
// api filter
router.get('/filter-by-all?', validateFilterFlightCity, validateFilterFlightSeat, validateFilterFlightDate, guestController.filterByAll);

// Upload Route
router.post('/upload', upload.single('file'), uploadFile);


export default router;