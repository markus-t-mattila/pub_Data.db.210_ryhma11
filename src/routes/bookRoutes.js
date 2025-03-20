import express from 'express';
import { searchBooks, titlesByClass } from '../controllers/bookController.js';

const router = express.Router();

router.get('/search', searchBooks);

router.get('/classes', titlesByClass);

export default router;