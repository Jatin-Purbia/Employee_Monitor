import express from 'express';
import {
  createCompany,
  getMyCompany,
  getCompanyById,
  updateCompany,
  generateInvitation,
  acceptInvitation,
} from '../controllers/companyController.js';
import { verifyToken, requireOwner } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Owner routes
router.post('/', requireOwner, createCompany);
router.get('/my-company', requireOwner, getMyCompany);
router.get('/:id', getCompanyById);
router.put('/:id', requireOwner, updateCompany);
router.post('/:id/invite', requireOwner, generateInvitation);

// Public invitation route (requires auth but not owner)
router.post('/accept-invitation', acceptInvitation);

export default router;

