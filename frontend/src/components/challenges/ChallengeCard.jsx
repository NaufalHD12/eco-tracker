import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Calendar,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800'
};

export const ChallengeCard = ({ challenge, onJoin, onDrop, joiningId }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const participant = challenge.participation;
  const isActive = participant && participant.status === 'active';
  const progress = challenge.progressPercentage || 0;

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">
              <Link
                to={`/challenges/${challenge._id}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {challenge.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {challenge.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={statusColors[challenge.status]}>
              {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
            </Badge>
            <Badge className={difficultyColors[challenge.difficulty]}>
              {challenge.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Category */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="capitalize">{challenge.category}</span>
          </div>

          {/* Dates */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              {challenge.daysRemaining !== null && challenge.daysRemaining > 0 && (
                <span className="text-orange-600 ml-1">
                  ({challenge.daysRemaining} days left)
                </span>
              )}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              <span>{challenge.totalParticipants} participants</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Zap className="w-4 h-4 mr-2" />
              <span>{challenge.targetEmission}kg target</span>
            </div>
          </div>

          {/* Progress bar for active challenges */}
          {challenge.status === 'active' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Rewards */}
          {challenge.rewards && (challenge.rewards.points > 0 || challenge.rewards.badge) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="w-4 h-4 mr-2 text-yellow-500" />
              <span>
                {challenge.rewards.points > 0 && `${challenge.rewards.points} points`}
                {challenge.rewards.points > 0 && challenge.rewards.badge && ' + '}
                {challenge.rewards.badge && 'Badge'}
              </span>
            </div>
          )}

          {/* User Participation Status */}
          {isActive && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">You're participating</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Points:</span>
                  <span className="font-medium">{participant.points}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Emissions reduced:</span>
                  <span className="font-medium">{participant.emissionSaved.toFixed(1)}kg</span>
                </div>
                {participant.streakDays > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Streak:</span>
                    <span className="font-medium">{participant.streakDays} days</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Join/Leave Button */}
          {isActive ? (
            <Button
              onClick={() => onDrop(challenge._id)}
              disabled={joiningId === challenge._id}
              variant="outline"
              className="w-full"
            >
              {joiningId === challenge._id ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                'Leave Challenge'
              )}
            </Button>
          ) : (
            challenge.status !== 'completed' && challenge.status !== 'cancelled' && (
              <Button
                onClick={() => onJoin(challenge._id)}
                disabled={joiningId === challenge._id}
                className="w-full"
              >
                {joiningId === challenge._id ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Challenge'
                )}
              </Button>
            )
          )}

          {/* View Details Link */}
          <div className="text-center">
            <Link
              to={`/challenges/${challenge._id}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Details →
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
