import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized to access this route',
        errors: [],
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          message: 'Not authorized to access this route',
          errors: [],
        });
      }

      req.user = {
        userId: user._id,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('JWT verification error:', error);
      }
      return res.status(401).json({
        message: 'Not authorized to access this route',
        errors: [],
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth middleware error:', error);
    }
    res.status(500).json({
      message: 'Server error in authentication',
      errors: [],
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      req.user = user ? {
        userId: user._id,
        name: user.name,
        email: user.email,
      } : null;

      next();
    } catch {
      req.user = null;
      next();
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Optional auth middleware error:', error);
    }
    req.user = null;
    next();
  }
};
