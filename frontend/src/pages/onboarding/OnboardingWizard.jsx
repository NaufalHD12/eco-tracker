import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Leaf, Target, Activity, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '@/config/api';
import { showToast } from '@/lib/utils';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Leaf },
  { id: 'target', title: 'Set Target', icon: Target },
  { id: 'activity', title: 'First Activity', icon: Activity },
  { id: 'complete', title: 'Complete', icon: CheckCircle },
];

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetEmission, setTargetEmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const response = await api.get('/onboarding/status');
      const { onboarding } = response.data;

      if (onboarding.completed) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      showToast.error('Failed to load onboarding status');
    }
  }, [navigate]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // Function removed - not used

  const handleWelcomeNext = async () => {
    try {
      setIsSubmitting(true);
      await api.post('/onboarding/step/welcome');
      setCurrentStep(1);
    } catch (error) {
      console.error('Error completing welcome step:', error);
      showToast.error('Failed to complete welcome step');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetTarget = async () => {
    if (!targetEmission || parseFloat(targetEmission) <= 0) {
      showToast.error('Please enter a valid target emission');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/onboarding/step/set_target', {
        stepId: 'set_target', // Joi validation requires stepId in body
        data: { targetEmission: parseFloat(targetEmission) }
      });
      setCurrentStep(2);
    } catch (error) {
      console.error('Error setting target:', error);

      // Show more detailed error message
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        'Failed to set target emission';
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipActivity = async () => {
    try {
      setIsSubmitting(true);
      await api.post('/onboarding/skip');
      showToast.success('Welcome to EcoTracker!');

      // Trigger ProtectedRoute to re-check onboarding status
      if (window.forceOnboardingRecheck) {
        window.forceOnboardingRecheck();
      }

      // Show complete step for 3 seconds celebration before navigating
      setCurrentStep(3);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000); // Celebration delay

    } catch (error) {
      console.error('Error skipping onboarding:', error);
      showToast.error('Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome Step
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-8">
                <Leaf className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Welcome to EcoTracker!
              </h2>
              <p className="text-lg text-muted-foreground">
                Track your carbon footprint and make a positive impact on the planet,
                one step at a time.
              </p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={handleWelcomeNext}
                disabled={isSubmitting}
                size="lg"
                className="px-8 py-3"
              >
                {isSubmitting ? 'Getting Started...' : 'Get Started'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 1: // Set Target Step
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-6">
                  <Target className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Set Your Emission Target
              </h2>
              <p className="text-muted-foreground">
                How much CO2 do you want to emit monthly? A typical person emits 100-150 kg CO2e per month.
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="target">Monthly Target (kg CO2e)</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="100"
                  value={targetEmission}
                  onChange={(e) => setTargetEmission(e.target.value)}
                  disabled={isSubmitting}
                  min="1"
                  step="0.1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(0)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSetTarget}
                  disabled={isSubmitting || !targetEmission}
                  className="flex-1"
                >
                  {isSubmitting ? 'Setting Target...' : 'Set Target'}
                  <Target className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 2: // First Activity Step
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-purple-100 p-8">
                <Activity className="h-16 w-16 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Log Your First Activity
              </h2>
              <p className="text-muted-foreground mb-6">
                Track your carbon footprint by logging your daily activities.
                Don't worry, we'll help you through your first entry!
              </p>

              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-foreground mb-2">Example Activities:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Driving to work (Transportation)</li>
                  <li>• Having a beef burger (Food)</li>
                  <li>• Using household electricity (Energy)</li>
                  <li>• Shopping groceries (Shopping)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSkipActivity}
                disabled={isSubmitting}
                variant="outline"
              >
                Skip for Now
              </Button>
              <Button
                onClick={() => navigate('/activities')}
                disabled={isSubmitting}
              >
                Start Logging
                <Activity className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 3: // Complete Step
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-8">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                You're All Set!
              </h2>
              <p className="text-lg text-muted-foreground">
                Welcome to your journey towards a sustainable lifestyle.
                Start tracking and making a difference today!
              </p>
            </div>
            <Button
              onClick={() => {
                // Update onboarding status and let parent handle navigation
                if (window.forceOnboardingRecheck) {
                  window.forceOnboardingRecheck();
                } else {
                  // Fallback: force navigation
                  window.location.href = '/dashboard';
                }
              }}
              size="lg"
              className="px-8 py-3"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };


  const progressValue = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};
