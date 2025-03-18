import express from 'express';
import { getCustomer, registerCustomer, loginCustomer } from '../controllers/customer.js';

const router = express.Router();

// Kun selain tekee GET /api/customers?id=xxx tai ?email=xxx, ohjataan getCustomer-funktioon
router.get('/', getCustomer);

// Kun selain tekee POST /api/customers, ohjataan registerCustomer-funktioon
router.post('/', registerCustomer);

// login
router.post('/login', loginCustomer);

export default router;
