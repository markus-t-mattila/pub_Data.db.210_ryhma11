import express from 'express';
import { getFile } from '../controllers/file.js';

const router = express.Router();

// GET /api/customers/stats
router.get('/:filename', getFile);

export default router;
