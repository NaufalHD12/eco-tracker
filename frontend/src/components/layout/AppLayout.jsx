import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';
import { LogActivityModal } from '@/components/activities/LogActivityModal';
import { ErrorBoundary } from '../ui/error-boundary';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Fab } from '../ui/fab';
import { Plus } from 'lucide-react';
import api from '@/config/api';

export const AppLayout = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await api.get('/onboarding/status');
      setOnboardingStatus(response.data.onboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Continue with onboarding as completed if API fails
      setOnboardingStatus({ completed: true });
    } finally {
      setOnboardingLoading(false);
    }
  };

  if (isLoading || onboardingLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // ProtectedRoute akan handle redirect
  }

  // Show onboarding wizard if not completed
  if (onboardingStatus && !onboardingStatus.completed) {
    return (
      <ErrorBoundary>
        <OnboardingWizard />
      </ErrorBoundary>
    );
  }

  const handleActivityLogged = () => {
    // Trigger dashboard refresh if needed
    // This could be enhanced with context or query invalidation
    window.location.reload(); // Temporary solution
  };

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative overflow-x-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <Header />
        <main className="relative pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
        <Navigation />

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-4 z-50 md:bottom-24 md:right-6">
          <Fab
            onClick={() => setIsModalOpen(true)}
            className="shadow-2xl"
            aria-label="Log new activity"
            title="Log new activity"
          >
            <Plus className="h-6 w-6" />
          </Fab>
        </div>
      </div>

      {/* Log Activity Modal */}
      <LogActivityModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleActivityLogged}
      />
    </>
  );
};
