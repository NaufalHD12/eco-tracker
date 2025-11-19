import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QuizResults } from '@/components/quizzes/QuizResults';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const QuizResultScreen = () => {
  const { id: quizId, attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = location.state;
    if (state?.results && state?.quiz) {
      setResults(state.results);
      setQuiz(state.quiz);
      setLoading(false);
    } else {
      // If no results data in state, try to fetch it
      fetchResults();
    }
  }, [location.state]);

  const fetchResults = async () => {
    try {
      const response = await import('@/config/api');
      const api = response.default;
      const resultsResponse = await api.get(`/quizzes/${quizId}/results/${attemptId}`);
      setResults(resultsResponse.data.results);
      setQuiz(resultsResponse.data.quiz);
    } catch (error) {
      console.error('Error fetching results:', error);
      // Redirect to quizzes if results not available
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/quizzes');
  };

  const handleRetake = () => {
    // Navigate back to quiz attempt screen to retake
    navigate(`/quizzes/${quizId}/attempt`, {
      state: { quiz }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <h3>Results not found</h3>
        <p>Please go back to the quizzes page and try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QuizResults
        results={results}
        onBack={handleBack}
        onRetake={handleRetake}
      />
    </div>
  );
};
