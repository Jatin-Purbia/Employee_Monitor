import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  getMyEmployeeProfile,
  updateEmployee,
} from '../controllers/employeeController.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/me', getMyEmployeeProfile);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', requireOwner, updateEmployee);

export default router;

