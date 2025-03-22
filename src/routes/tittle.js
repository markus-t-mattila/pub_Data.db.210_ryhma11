import express from 'express';
import { addTitle } from '../controllers/title.js';

const router = express.Router();

router.post('/', addTitle);

export default router;