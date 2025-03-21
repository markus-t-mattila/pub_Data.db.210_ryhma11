import express from 'express';
import { searchBooks, queryBooks } from '../controllers/bookController.js';

const router = express.Router();

router.get('/search', searchBooks);

router.get('/', queryBooks);

export default router;