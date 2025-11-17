import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  targetEmission: {
    type: Number,
    default: 100,
    min: [0, 'Target emission cannot be negative'],
  },
  totalEmission: {
    type: Number,
    default: 0,
    min: [0, 'Total emission cannot be negative'],
  },
  totalTrees: {
    type: Number,
    default: 0,
    min: [0, 'Total trees cannot be negative'],
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  onboardingSteps: [{
    stepId: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    // Use lower salt rounds in development for better performance
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 8;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
