import express from "express";
import dummyController from "../controllers/dummy.js";
import authControllers from "../controllers/auth.controllers.js";

const router = express.Router();

router.get("/dummy", dummyController.dummy);
router.post("/register", authControllers.register)

export default router;