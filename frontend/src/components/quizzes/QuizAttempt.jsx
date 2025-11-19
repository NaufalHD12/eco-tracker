import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Brain,
  Timer
} from 'lucide-react';

export const QuizAttempt = ({
  quiz,
  onSubmit,
  onBack,
  isSubmitting = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime] = useState(() => Date.now());
  const questionStartTimeRef = useRef(null);

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = quiz?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Calculate time spent on current question
  const getTimeSpentOnCurrent = () => {
    return Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
  };

  // Handle answer selection
  const handleAnswerChange = (selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: {
        questionId: currentQuestion._id,
        selectedAnswer: parseInt(selectedAnswer),
        timeSpent: prev[currentQuestion._id]?.timeSpent || 0  // Preserve existing time spent
      }
    }));
  };

  // Navigate to question
  const goToQuestion = (index) => {
    // Record time spent on current question before switching
    if (currentQuestion && answers[currentQuestion._id]) {
      const timeSpent = getTimeSpentOnCurrent();
      setAnswers(prev => ({
        ...prev,
        [currentQuestion._id]: {
          ...prev[currentQuestion._id],
          timeSpent: prev[currentQuestion._id].timeSpent + timeSpent
        }
      }));
    }

    setCurrentQuestionIndex(index);
  };

  // Handle next/previous navigation
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    // Record time for current question
    if (currentQuestion && answers[currentQuestion._id]) {
      const timeSpent = getTimeSpentOnCurrent();
      setAnswers(prev => ({
        ...prev,
        [currentQuestion._id]: {
          ...prev[currentQuestion._id],
          timeSpent: prev[currentQuestion._id].timeSpent + timeSpent
        }
      }));
    }

    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    const formattedAnswers = Object.values(answers);

    onSubmit({
      answers: formattedAnswers,
      timeSpent: totalTimeSpent
    });
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start time tracking for current question
  useEffect(() => {
    if (currentQuestion) {
      questionStartTimeRef.current = Date.now();
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!quiz || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3>Loading quiz...</h3>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion._id];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              {quiz.title}
            </CardTitle>
            <Button variant="ghost" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Progress and Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              </div>
              <div className="flex items-center">
                <Timer className="w-4 h-4 mr-1" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
              <div>
                <span>{answeredCount}/{totalQuestions} answered</span>
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="mb-2">
              {currentQuestion.category || 'General'}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.points} points
            </Badge>
          </div>
          <CardTitle className="text-xl">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <RadioGroup
            value={currentAnswer?.selectedAnswer?.toString() || ""}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 text-base cursor-pointer p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <Button
              key={i}
              onClick={() => goToQuestion(i)}
              variant={i === currentQuestionIndex ? "default" : answers[quiz.questions[i]._id] ? "secondary" : "outline"}
              size="sm"
              className="w-10 h-10 p-0"
            >
              {i + 1}
            </Button>
          ))}
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount === 0}
            className="min-w-24"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={goToNext} disabled={currentQuestionIndex === totalQuestions - 1}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {answeredCount} of {totalQuestions} questions answered ({Math.round(progress)}% complete)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
