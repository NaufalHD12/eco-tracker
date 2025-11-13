import express from 'express';
import {getFactors} from '../controllers/factorsController.js';
import {protect} from '../middleware/auth.js';
import {factorsCacheMiddleware} from '../middleware/cache.js';

const router = express.Router();

// All factors routes require authentication
router.use(protect);

// Apply cache middleware after authentication for GET requests
router.use(factorsCacheMiddleware);

router.get('/', getFactors);

export default router;
