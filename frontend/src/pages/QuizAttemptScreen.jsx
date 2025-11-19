import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QuizAttempt } from '@/components/quizzes/QuizAttempt';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import api from '@/config/api';
import { showToast } from '@/lib/utils';

export const QuizAttemptScreen = () => {
  const { id: quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch quiz details and start attempt
      const [quizRes, attemptRes] = await Promise.all([
        api.get(`/quizzes/${quizId}`),
        api.post(`/quizzes/${quizId}/attempt`)
      ]);

      setQuiz(quizRes.data.quiz);
      setAttemptId(attemptRes.data.attempt.id);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      showToast.error('Failed to load quiz');
      navigate('..');
    } finally {
      setLoading(false);
    }
  }, [quizId, navigate]);

  useEffect(() => {
    const state = location.state;
    let quizData = state?.quiz;
    const attemptIdData = state?.attemptId;

    // If we have quiz._id but no questions (from list view), fetch full quiz data
    if (quizData && !quizData.questions && quizId) {
      fetchQuizDetails();
    } else if (quizData && quizData.questions && attemptIdData) {
      setQuiz(quizData);
      setAttemptId(attemptIdData);
      setLoading(false);
    } else {
      // If no quiz data, try to fetch it
      fetchQuizDetails();
    }
  }, [location.state, navigate, quizId, fetchQuizDetails]);

  const handleSubmitQuiz = async (quizData) => {
    if (!quiz || !attemptId) return;

    try {
      setSubmitting(true);
      await api.post(`/quizzes/${quizId}/submit`, quizData);

      // Fetch detailed results
      const resultsResponse = await api.get(`/quizzes/${quizId}/results/${attemptId}`);
      const detailedResults = resultsResponse.data;

      // Navigate to results
      navigate(`results/${attemptId}`, {
        state: { results: detailedResults.results, quiz: detailedResults.quiz }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Error handling will be done in the component
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('..');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3>Quiz not found</h3>
        <p>Please go back to the quizzes page and try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QuizAttempt
        quiz={quiz}
        attemptId={attemptId}
        onSubmit={handleSubmitQuiz}
        onBack={handleBack}
        isSubmitting={submitting}
      />
    </div>
  );
};
