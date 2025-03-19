import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/admin.js';

const router = express.Router();

// POST /admin/register
router.post('/register', registerAdmin);

// Adminin kirjautuminen
router.post("/login", loginAdmin);

export default router;