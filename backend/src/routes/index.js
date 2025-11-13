import express from 'express';
import userRoutes from './userRoutes.js';
import activityRoutes from './activityRoutes.js';
import factorsRoutes from './factorsRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import challengeRoutes from './challengeRoutes.js';
import quizRoutes from './quizRoutes.js';

const router = express.Router();

router.use('/', userRoutes);
router.use('/activities', activityRoutes);
router.use('/factors', factorsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/challenges', challengeRoutes);
router.use('/quizzes', quizRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'EcoTrack API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
