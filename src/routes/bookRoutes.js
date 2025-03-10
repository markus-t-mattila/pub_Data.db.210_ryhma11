import express from 'express';
import { searchBooks } from '../controllers/bookController.js';

const router = express.Router();

router.get('/search', searchBooks);

export default router;