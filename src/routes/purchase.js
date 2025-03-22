import express from 'express';
import { reserveBook } from '../controllers/purchase.js';

const router = express.Router();

// GET /api/customers/stats
router.post('/reserve', reserveBook);

export default router;