import express from 'express';
import {
  addingStock,
} from '../controllers/stockControllers.js';
const router = express.Router();
router.post('/addStock',  addingStock);
export default router;