import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, Brain, CheckCircle, Lock } from 'lucide-react';

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const categoryColors = {
  'Environment': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Sustainability': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Climate Change': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Energy': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Transportation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export const QuizCard = ({ quiz, hasAttempted, onStart }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              {quiz.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {quiz.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={difficultyColors[quiz.difficulty]}>
            {quiz.difficulty}
          </Badge>
          <Badge className={categoryColors[quiz.category] || 'bg-gray-100 text-gray-800'}>
            {quiz.category}
          </Badge>
          {hasAttempted && (
            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Quiz Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Trophy className="w-4 h-4 mr-2" />
              <span>{quiz.totalPoints} pts</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Brain className="w-4 h-4 mr-2" />
              <span>{quiz.totalQuestions} Qs</span>
            </div>
          </div>

          {/* Previous Attempt Info */}
          {hasAttempted && quiz.previousAttempt && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Previous Score</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {quiz.previousAttempt.grade}
                </Badge>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {quiz.previousAttempt.score}/{quiz.totalPoints} pts ({quiz.previousAttempt.percentage}%)
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={onStart}
            className="w-full"
          >
            {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
