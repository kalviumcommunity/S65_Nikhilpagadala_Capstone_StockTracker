import express from 'express';
import {
  addingStock,
  gettingStocks
} from '../controllers/stockControllers.js';
const router = express.Router();
router.post('/addStock',  addingStock);
router.get('/getStocks',  gettingStocks);
export default router;