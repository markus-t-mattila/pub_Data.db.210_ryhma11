import express from 'express';
import { addTitle, getDistinctTitles } from '../controllers/title.js';

const router = express.Router();

router.post('/', addTitle);

router.get('/', getDistinctTitles); // huom vain distinct arvot

export default router;