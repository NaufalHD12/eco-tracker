import express from 'express';
import {getDashboard} from '../controllers/dashboardController.js';
import {protect} from '../middleware/auth.js';
import {dashboardCacheMiddleware} from '../middleware/cache.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Apply cache middleware after authentication for GET requests
router.use(dashboardCacheMiddleware);

router.get('/', getDashboard);

export default router;
