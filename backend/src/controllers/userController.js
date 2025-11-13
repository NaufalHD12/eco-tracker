import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const {name, email, password} = req.body;

    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
        errors: [],
      });
    }

    const user = await User.create({name, email, password});
    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      targetEmission: user.targetEmission,
      totalEmission: user.totalEmission,
      totalTrees: user.totalTrees,
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Register error:', error);
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({message: 'Validation failed', errors});
    }

    res.status(500).json({
      message: 'Server error during registration',
      errors: [],
    });
  }
};

/**
 * Authenticate user login
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        errors: [],
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
        errors: [],
      });
    }

    const token = generateToken(user._id);
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      targetEmission: user.targetEmission,
      totalEmission: user.totalEmission,
      totalTrees: user.totalTrees,
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    res.status(500).json({
      message: 'Server error during login',
      errors: [],
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [],
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      targetEmission: user.targetEmission,
      totalEmission: user.totalEmission,
      totalTrees: user.totalTrees,
    };

    res.json({
      message: 'Profile retrieved successfully',
      user: userResponse,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get profile error:', error);
    }
    res.status(500).json({
      message: 'Server error',
      errors: [],
    });
  }
};

/**
 * Update current user profile
 * @route PUT /api/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const {name, targetEmission} = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (targetEmission !== undefined) updateData.targetEmission = targetEmission;

    // Check if at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'At least one field must be provided for update',
        errors: [],
      });
    }

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        updateData,
        {new: true, runValidators: true},
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [],
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      targetEmission: user.targetEmission,
      totalEmission: user.totalEmission,
      totalTrees: user.totalTrees,
    };

    res.json({
      message: 'Profile updated successfully',
      user: userResponse,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update profile error:', error);
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({message: 'Validation failed', errors});
    }

    res.status(500).json({
      message: 'Server error',
      errors: [],
    });
  }
};

/**
 * Change user password
 * @route PUT /api/profile/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const {currentPassword, newPassword} = req.body;

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [],
      });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: 'Current password is incorrect',
        errors: [],
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Change password error:', error);
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({message: 'Validation failed', errors});
    }

    res.status(500).json({
      message: 'Server error',
      errors: [],
    });
  }
};
