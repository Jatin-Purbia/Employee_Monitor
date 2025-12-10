import express from 'express';
import {
  uploadScreenshot,
  getScreenshots,
  getScreenshotImage,
  deleteScreenshot,
} from '../controllers/screenshotController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post('/', uploadScreenshot);
router.get('/', getScreenshots);
router.get('/:id/image', getScreenshotImage);
router.delete('/:id', deleteScreenshot);

export default router;

