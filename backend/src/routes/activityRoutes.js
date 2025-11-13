import express from 'express';
import {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
} from '../controllers/activityController.js';
import {protect} from '../middleware/auth.js';
import {validator} from '../middleware/validation.js';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
  activityStatsQuerySchema,
} from '../validator/activity/schema.js';

const router = express.Router();

// All activity routes require authentication
router.use(protect);

router.get('/', validator.query(activityQuerySchema), getActivities);
router.post('/', validator.body(createActivitySchema), createActivity);
router.get('/stats/summary', validator.query(activityStatsQuerySchema), getActivityStats);
router.get('/:id', getActivity);
router.put('/:id', validator.body(updateActivitySchema), updateActivity);
router.delete('/:id', deleteActivity);

export default router;
