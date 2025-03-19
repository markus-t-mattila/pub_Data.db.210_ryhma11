import express from 'express';
import { registerAdmin } from '../controllers/admin.js';

const router = express.Router();

// POST /admin/register
router.post('/register', registerAdmin);

export default router;