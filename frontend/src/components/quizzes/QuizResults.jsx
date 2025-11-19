import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  Target,
  Brain,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export const QuizResults = ({ results, onBack, onRetake }) => {
  if (!results) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3>Loading results...</h3>
      </div>
    );
  }

  const { score, totalPoints, percentage, correctAnswers, totalQuestions, grade, timeSpent, answers } = results;

  // Calculate performance metrics
  const isPassed = results.isPassed || grade !== 'F';
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={isPassed ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isPassed ? (
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 mr-3" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  Quiz Complete!
                </CardTitle>
                <p className="text-muted-foreground">
                  You scored {score} out of {totalPoints} points
                </p>
              </div>
            </div>
            <Badge
              className={`text-lg px-3 py-1 ${
                grade === 'A' ? 'bg-green-100 text-green-800' :
                grade === 'B' ? 'bg-blue-100 text-blue-800' :
                grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                grade === 'D' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              Grade {grade}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Score</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <div className="font-medium">{grade}</div>
                <div className="text-xs text-muted-foreground">Grade</div>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <div className="font-medium">{formatTime(timeSpent)}</div>
                <div className="text-xs text-muted-foreground">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Correct Answers:</span>
                <span className="font-medium text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span>Incorrect Answers:</span>
                <span className="font-medium text-red-600">{totalQuestions - correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span>Points Earned:</span>
                <span className="font-medium">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Points:</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {answers?.map((answer, index) => (
              <div
                key={answer.questionId || index}
                className={`p-4 rounded-lg border ${
                  answer.isCorrect
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium flex-1">
                    Question {index + 1}: {answer.question}
                  </h4>
                  {answer.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-2 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 ml-2 shrink-0" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Your Answer:</div>
                    <div className={`font-medium ${
                      answer.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {answer.selectedAnswerText}
                    </div>
                  </div>
                  {!answer.isCorrect && (
                    <div>
                      <div className="text-muted-foreground mb-1">Correct Answer:</div>
                      <div className="font-medium text-green-700">
                        {answer.correctAnswerText}
                      </div>
                    </div>
                  )}
                </div>

                {answer.explanation && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-muted-foreground text-sm mb-1">Explanation:</div>
                    <p className="text-sm">{answer.explanation}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <span>{answer.pointsEarned}/{answer.pointsPossible} points</span>
                  <span>Time: {formatTime(answer.timeSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quizzes
        </Button>
        <Button onClick={onRetake}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
};
