import express from 'express';
import { reserveBook, cancelReservation } from '../controllers/purchase.js';

const router = express.Router();

// GET /api/customers/stats
router.post('/reserve', reserveBook);

router.post('/release', cancelReservation);

export default router;