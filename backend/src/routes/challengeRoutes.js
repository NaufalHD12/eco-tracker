import express from 'express';
import {
  getChallenges,
  getActiveChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  getChallengeLeaderboard,
  updateChallengeProgress,
} from '../controllers/challengeController.js';
import {protect} from '../middleware/auth.js';
import {
  validateCreateChallenge,
  validateUpdateChallenge,
  validateChallengeQuery,
  validateLeaderboardQuery,
} from '../validator/challenge/index.js';

const router = express.Router();

// All challenge routes require authentication
router.use(protect);

router.get('/', validateChallengeQuery, getChallenges);
router.post('/', validateCreateChallenge, createChallenge);
router.get('/active', getActiveChallenges);
router.get('/:id', getChallenge);
router.put('/:id', validateUpdateChallenge, updateChallenge);
router.delete('/:id', deleteChallenge);
router.post('/:id/join', joinChallenge);
router.get('/:id/leaderboard', validateLeaderboardQuery, getChallengeLeaderboard);
router.post('/:id/update-progress', updateChallengeProgress);

export default router;
