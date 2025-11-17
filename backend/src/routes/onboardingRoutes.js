import express from 'express';
import {
  getOnboardingStatus,
  completeOnboardingStep,
  skipOnboarding,
} from '../controllers/onboardingController.js';
import {validator} from '../middleware/validation.js';
import {completeStepValidator} from '../validator/onboarding/index.js';
import {protect} from '../middleware/auth.js';

const router = express.Router();

// All onboarding routes require authentication
router.use(protect);

router.get('/status', getOnboardingStatus);
router.post('/step/:stepId', validator.body(completeStepValidator.body), completeOnboardingStep);
router.post('/skip', skipOnboarding);

export default router;
