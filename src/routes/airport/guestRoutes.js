import express from 'express';
import {getDaerah, getDaerahKota} from '../../controllers/airport/guestController.js';

const router = express.Router();

router.get('/daerah', getDaerah);
router.get('/daerah/:city', getDaerahKota);

export default router;