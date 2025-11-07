import express from 'express';
import { registerUser } from '../controllers/userControllers.js';
import loginUser from '../controllers/LoginControllers.js';
import {
  addingStock,
  gettingStocks,
  deleteStock,
  updateStock,
} from '../controllers/stockControllers.js';


const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes - require valid JWT
router.post('/addStock',  addingStock);
router.get('/getStocks',  gettingStocks);
router.put('/updateStock/:symbol', updateStock);
router.delete('/deleteStock/:symbol',  deleteStock);

export default router;
