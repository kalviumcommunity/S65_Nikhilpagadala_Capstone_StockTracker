import express from 'express';
import { registerUser } from '../controllers/userControllers.js';
import loginUser from '../controllers/LoginControllers.js';
import {
  addingStock,
  gettingStocks,
  deleteStock,
  updateStock,
} from '../controllers/stockControllers.js';
import verifyToken from '../middlewares/verifyToken.js'; // middleware to verify JWT

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes - require valid JWT
router.post('/addStock', verifyToken, addingStock);
router.get('/getStocks', verifyToken, gettingStocks);
router.put('/updateStock/:symbol', verifyToken, updateStock);
router.delete('/deleteStock/:symbol', verifyToken, deleteStock);

export default router;
