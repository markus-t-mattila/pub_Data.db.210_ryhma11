import express from 'express';
import { calculateDeliveryCost } from '../controllers/shipping.js';

const router = express.Router();

router.post('/delivery-cost', calculateDeliveryCost);

export default router;
