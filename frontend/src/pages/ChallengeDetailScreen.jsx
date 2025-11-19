import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  Zap,
  Award,
  TrendingUp,
  Medal,
  Star
} from 'lucide-react';
import { showToast } from '@/lib/utils';
import api from '@/config/api';

export const ChallengeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const fetchChallenge = useCallback(async () => {
    try {
      const [challengeRes, leaderboardRes] = await Promise.all([
        api.get(`/challenges/${id}`),
        api.get(`/challenges/${id}/leaderboard`)
      ]);

      setChallenge(challengeRes.data.challenge);
      setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      showToast.error('Failed to load challenge details');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleJoinChallenge = async () => {
    if (!challenge) return;

    try {
      setJoining(true);
      await api.post(`/challenges/${id}/join`);

      showToast.success('Successfully joined the challenge!');

      // Refresh data
      await fetchChallenge();
    } catch (error) {
      console.error('Error joining challenge:', error);

      if (error.response?.status === 409) {
        showToast.warning('You are already participating in this challenge');
      } else if (error.response?.status === 400) {
        showToast.error('Challenge is full or no longer available');
      } else {
        showToast.error(error.response?.data?.message || 'Failed to join challenge');
      }
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const participant = challenge?.participation;
  const isJoined = !!participant;

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <h2>Challenge not found</h2>
          <Link to="/challenges">
            <Button className="mt-4">Back to Challenges</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link to="/challenges">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{challenge.title}</h1>
          <div className="flex items-center space-x-2">
            <Badge className={`${
              challenge.status === 'active' ? 'bg-green-100 text-green-800' :
              challenge.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
            </Badge>
            <Badge className="bg-orange-100 text-orange-800">
              {challenge.difficulty}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              {challenge.category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            {challenge.description}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          {/* Challenge Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Challenge Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                </div>
                {challenge.daysRemaining !== null && (
                  <div className="flex items-center text-sm text-orange-600 mt-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{challenge.daysRemaining} days left</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Target & Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Zap className="w-4 h-4 mr-2" />
                  <span>Target: {challenge.targetEmission}kg CO₂e</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{challenge.totalParticipants} participants</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                {challenge.rewards && (challenge.rewards.points > 0 || challenge.rewards.badge) ? (
                  <div className="space-y-1">
                    {challenge.rewards.points > 0 && (
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{challenge.rewards.points} points</span>
                      </div>
                    )}
                    {challenge.rewards.badge && (
                      <div className="flex items-center text-sm">
                        <Award className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{challenge.rewards.badge}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No rewards available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress & Rules */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Challenge Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {challenge.progressPercentage !== undefined ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Total emissions saved</span>
                      <span>{challenge.totalEmissionSaved?.toFixed(1) || 0}kg reduced</span>
                    </div>
                    <Progress value={challenge.progressPercentage} className="h-3" />
                    <p className="text-center text-sm text-muted-foreground">
                      {challenge.progressPercentage}% towards {challenge.targetEmission}kg target
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Progress not available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Challenge Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {challenge.rules && challenge.rules.length > 0 ? (
                  <ul className="space-y-2">
                    {challenge.rules.map((rule, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No special rules</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Participation */}
          {isJoined && (
            <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{participant.points}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{participant.emissionSaved.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">kg CO₂e reduced</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{participant.streakDays}</div>
                  <div className="text-sm text-muted-foreground">day streak</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Personal Progress</span>
                  <span>{participant.progress?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={participant.progress || 0} className="h-2" />
              </div>
            </CardContent>
            </Card>
          )}

          {/* Join Button */}
          {!isJoined && challenge.status !== 'completed' && challenge.status !== 'cancelled' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-medium">Ready to Join?</h3>
                  <p className="text-muted-foreground">
                    Track your activities during the challenge to reduce emissions and earn points!
                  </p>
                  <Button
                    onClick={handleJoinChallenge}
                    disabled={joining}
                    size="lg"
                  >
                    {joining ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Challenge'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Challenge Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.user._id === challenge.participation?.user;
                    return (
                      <div
                        key={entry.user._id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isCurrentUser ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            {entry.rank <= 3 ? (
                              <Medal className={`w-4 h-4 ${
                                entry.rank === 1 ? 'text-yellow-500' :
                                entry.rank === 2 ? 'text-gray-400' :
                                'text-amber-600'
                              }`} />
                            ) : (
                              <span className="text-sm font-medium">#{entry.rank}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {entry.user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">@{entry.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{entry.points} pts</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.emissionSaved.toFixed(1)}kg CO₂e
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No participants yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to join and lead the leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
