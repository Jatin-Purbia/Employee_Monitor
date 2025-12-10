import express from 'express';
import {
  signup,
  login,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateProfile);

export default router;

