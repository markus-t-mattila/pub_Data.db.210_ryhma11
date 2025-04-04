import express from 'express';
import { getCustomer, registerCustomer, loginCustomer, getMyProfile, createCustomersStatsFile } from '../controllers/customer.js';
import { requireAdmin, requireLogin } from '../middleware/auth.js'; 

const router = express.Router();

// GET /api/customers/stats
router.get('/stats', requireAdmin, createCustomersStatsFile);

// Kun selain tekee GET /api/customers?id=xxx tai ?email=xxx, ohjataan getCustomer-funktioon
router.get('/', getCustomer);

// Kun selain tekee POST /api/customers, ohjataan registerCustomer-funktioon
router.post('/', registerCustomer);

// login
router.post('/login', loginCustomer);

router.get('/me', requireLogin, getMyProfile)

export default router;
