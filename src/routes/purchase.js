import express from 'express';
import { reserveBook, cancelReservation, extendReservationTime, createPurchaseOrder } from '../controllers/purchase.js';

const router = express.Router();

// GET /api/customers/stats
router.post('/reserve', reserveBook);

router.post('/release', cancelReservation);

router.post('/extend-reservation', extendReservationTime);

router.post('/order', createPurchaseOrder);


export default router;