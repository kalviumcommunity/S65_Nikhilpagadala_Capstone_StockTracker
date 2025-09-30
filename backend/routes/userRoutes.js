import express from 'express';
import {
  addingStock,
  gettingStocks,
  updateStock,
  deleteStock
} from '../controllers/stockControllers.js';
const router = express.Router();
router.post('/addStock',  addingStock);
router.get('/getStocks',  gettingStocks);
router.put('/updateStock/:symbol', updateStock);
router.delete('/deleteStock/', deleteStock);
export default router;