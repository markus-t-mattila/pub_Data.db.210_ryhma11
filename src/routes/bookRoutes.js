import express from 'express';
import { searchBooks, queryBooks, addBookWithTitleService, availableBooks, titlesByClass } from '../controllers/bookController.js';

const router = express.Router();

router.get('/search', searchBooks);

router.get('/classes', titlesByClass);

router.get('/available', availableBooks);

router.get('/', queryBooks);

router.post('/', addBookWithTitleService);

export default router;