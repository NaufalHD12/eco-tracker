import User from '../models/User.js';

/**
 * Get onboarding status for current user
 * @route GET /api/onboarding/status
 * @access Private
 */
export const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [],
      });
    }

    // Define available onboarding steps
    const availableSteps = [
      'welcome',
      'set_target',
      'first_activity',
      'explore_dashboard',
    ];

    // Check which steps are completed
    const completedSteps = user.onboardingSteps.map((step) => step.stepId);
    const remainingSteps = availableSteps.filter((step) => !completedSteps.includes(step));

    res.json({
      message: 'Onboarding status retrieved successfully',
      onboarding: {
        completed: user.onboardingCompleted,
        completedSteps: user.onboardingSteps,
        remainingSteps,
        totalSteps: availableSteps.length,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get onboarding status error:', error);
    }
    res.status(500).json({
      message: 'Server error',
      errors: [],
    });
  }
};

/**
 * Complete a specific onboarding step
 * @route POST /api/onboarding/step/:stepId
 * @access Private
 */
export const completeOnboardingStep = async (req, res) => {
  try {
    const {stepId} = req.params;
    const data = req.body?.data || {};

    const validSteps = ['welcome', 'set_target', 'first_activity', 'explore_dashboard'];

    if (!validSteps.includes(stepId)) {
      return res.status(400).json({
        message: 'Invalid step ID',
        errors: [{field: 'stepId', message: 'Step ID must be one of: ' + validSteps.join(', ')}],
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [],
      });
    }

    // Check if step already completed
    const existingStep = user.onboardingSteps.find((step) => step.stepId === stepId);
    if (existingStep) {
      return res.status(409).json({
        message: 'Step already completed',
        errors: [],
      });
    }

    // Add step to completed steps
    user.onboardingSteps.push({
      stepId,
      completedAt: new Date(),
    });

    // Special handling for specific steps
    if (stepId === 'set_target' && data && data.targetEmission) {
      user.targetEmission = data.targetEmission;
    }

    // Check if all steps are completed
    const completedStepIds = [...user.onboardingSteps.map((s) => s.stepId), stepId];
    user.onboardingCompleted = validSteps.every((step) => completedStepIds.includes(step));

    await user.save();

    res.json({
      message: 'Step completed successfully',
      stepId,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Complete onboarding step error:', error);
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
 * Skip onboarding entirely
 * @route POST /api/onboarding/skip
 * @access Private
 */
export const skipOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
        req.user.userId,
        {onboardingCompleted: true},
        {new: true},
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: [],
      });
    }

    res.json({
      message: 'Onboarding skipped successfully',
      onboardingCompleted: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Skip onboarding error:', error);
    }
    res.status(500).json({
      message: 'Server error',
      errors: [],
    });
  }
};
