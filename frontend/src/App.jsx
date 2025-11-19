import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EmissionFactorsProvider } from '@/contexts/EmissionFactorsContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginScreen } from '@/pages/auth/LoginScreen';
import { RegisterScreen } from '@/pages/auth/RegisterScreen';
import { DashboardScreen } from '@/pages/DashboardScreen';
import { ActivitiesScreen } from '@/pages/ActivitiesScreen';
import { ChallengesScreen } from '@/pages/ChallengesScreen';
import { ChallengeDetailScreen } from '@/pages/ChallengeDetailScreen';
import { QuizzesScreen } from '@/pages/QuizzesScreen';
import { QuizAttemptScreen } from '@/pages/QuizAttemptScreen';
import { QuizResultScreen } from '@/pages/QuizResultScreen';
import { ProfileScreen } from '@/pages/ProfileScreen';
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';

// Landing page wrapper to handle auth redirect
const LandingOrRedirect = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <EmissionFactorsProvider>
        <AuthProvider>
          <Router>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingOrRedirect />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Protected routes with layout */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="activities" element={<ActivitiesScreen />} />
              <Route path="challenges" element={<ChallengesScreen />} />
              <Route path="challenges/:id" element={<ChallengeDetailScreen />} />
              <Route path="quizzes" element={<QuizzesScreen />} />
              <Route path="quizzes/:id/attempt" element={<QuizAttemptScreen />} />
              <Route path="quizzes/:id/results/:attemptId" element={<QuizResultScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
            </Route>

            {/* Catch all - redirect to root for auth handling */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </AuthProvider>
      </EmissionFactorsProvider>
    </ThemeProvider>
  );
}

export default App;
