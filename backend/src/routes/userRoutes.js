import express from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/userController.js';
import {protect} from '../middleware/auth.js';
import {validator} from '../middleware/validation.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validator/user/index.js';

const router = express.Router();

// Public routes
router.post('/auth/register', validator.body(registerSchema), register);
router.post('/auth/login', validator.body(loginSchema), login);
router.post('/auth/refresh', refreshToken);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validator.body(updateProfileSchema), updateProfile);
router.put('/profile/change-password', protect, validator.body(changePasswordSchema), changePassword);

export default router;
