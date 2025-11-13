import express from 'express';
import {
  getQuizzes,
  getActiveQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuiz,
  getQuizResults,
  getUserQuizStats,
  getQuizStats,
} from '../controllers/quizController.js';
import {protect} from '../middleware/auth.js';
import {quizCacheMiddleware} from '../middleware/cache.js';
import {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateQuizQuery,
  validateSubmitQuiz,
} from '../validator/quiz/index.js';

const router = express.Router();

// All quiz routes require authentication
router.use(protect);

// Apply cache middleware after authentication for GET requests
router.use(quizCacheMiddleware);

router.get('/', validateQuizQuery, getQuizzes);
router.get('/active', getActiveQuizzes);
router.get('/:id', getQuiz);
router.post('/', validateCreateQuiz, createQuiz);
router.put('/:id', validateUpdateQuiz, updateQuiz);
router.delete('/:id', deleteQuiz);
router.post('/:id/attempt', startQuizAttempt);
router.post('/:id/submit', validateSubmitQuiz, submitQuiz);
router.get('/:id/results/:attemptId', getQuizResults);
router.get('/stats/user', getUserQuizStats);
router.get('/:id/stats', getQuizStats);

export default router;
