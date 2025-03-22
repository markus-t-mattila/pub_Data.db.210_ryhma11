import express from 'express';
import { searchStores } from '../controllers/stores.js';

const router = express.Router();

router.get('/', searchStores);

export default router;