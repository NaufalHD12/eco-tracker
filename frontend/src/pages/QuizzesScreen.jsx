import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { QuizCard } from '@/components/quizzes/QuizCard';
import { Brain, RotateCcw } from 'lucide-react';
import { showToast } from '@/lib/utils';
import api from '@/config/api';

export const QuizzesScreen = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cooldownInfo, setCooldownInfo] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await api.get('/quizzes/active');
      setQuizzes(response.data.quizzes || []);
      setCooldownInfo(response.data.cooldownInfo || null);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      showToast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleStartQuiz = async (quiz) => {
    if (!quiz) return;

    try {
      // Navigate to quiz attempt screen, which will handle fetching data and starting attempt
      navigate(`${quiz._id}/attempt`, {
        state: { quiz }
      });
    } catch (error) {
      console.error('Error navigating to quiz:', error);
      showToast.error('Failed to start quiz');
    }
  };

  const formatNextAvailableDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Quizzes</h1>
        </div>

        {(quizzes.length === 0) && (
          <Button onClick={() => fetchQuizzes()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* Cooldown Message */}
      {quizzes.length === 0 && cooldownInfo && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-300">
              No Available Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              You've recently completed all available quizzes. Please wait until the cooldown period ends.
            </p>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              <strong>Next quiz available:</strong> {formatNextAvailableDate(cooldownInfo.nextAvailableDate)}
              <br />
              Cooldown period: {cooldownInfo.cooldownDays} days
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quizzes List */}
      {quizzes.length > 0 && (
        <div className="grid gap-6">
          {quizzes.map((quiz) => {
            // Check if user has a previous attempt
            const hasAttempted = quiz.previousAttempt !== undefined;

            return (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                hasAttempted={hasAttempted}
                onStart={() => handleStartQuiz(quiz)}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {quizzes.length === 0 && !cooldownInfo && !loading && (
        <EmptyState
          icon={<Brain className="w-16 h-16" />}
          title="No Quizzes Available"
          description="Check back later for new quizzes to test your knowledge and earn rewards!"
          action={
            <Button variant="outline" onClick={() => fetchQuizzes()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          }
        />
      )}
    </div>
  );
};
