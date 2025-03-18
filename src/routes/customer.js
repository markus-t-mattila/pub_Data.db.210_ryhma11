import express from 'express';
import { getCustomer, registerCustomer } from '../controllers/customer.js';

const router = express.Router();

// Kun selain tekee GET /api/customers?id=xxx tai ?email=xxx, ohjataan getCustomer-funktioon
router.get('/', getCustomer);

// Kun selain tekee POST /api/customers, ohjataan registerCustomer-funktioon
router.post('/', registerCustomer);

export default router;
