import express from 'express';
import { getFile } from '../controllers/file.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/customers/stats
// only used for admin purposes in CSV export.
router.get('/:filename', requireAdmin, getFile);

export default router;
