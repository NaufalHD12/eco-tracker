import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Trophy, AlertCircle } from 'lucide-react';
import { showToast } from '@/lib/utils';
import api from '@/config/api';

export const ChallengesScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [joiningId, setJoiningId] = useState(null);

  const fetchChallenges = async (tab) => {
    try {
      setLoading(true);
      let response;

      if (tab === 'active') {
        response = await api.get('/challenges/active');
      } else {
        response = await api.get('/challenges');
      }

      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      showToast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges(activeTab);
  }, [activeTab]);

  const handleJoinChallenge = async (challengeId) => {
    try {
      setJoiningId(challengeId);
      await api.post(`/challenges/${challengeId}/join`);

      showToast.success('Successfully joined the challenge!');

      // Refresh data after join
      await fetchChallenges(activeTab);
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
      setJoiningId(null);
    }
  };

  const handleDropChallenge = async (challengeId) => {
    try {
      setJoiningId(challengeId);
      await api.post(`/challenges/${challengeId}/drop`);

      showToast.success('Successfully left the challenge');

      // Refresh data after drop
      await fetchChallenges(activeTab);
    } catch (error) {
      console.error('Error leaving challenge:', error);
      showToast.error(error.response?.data?.message || 'Failed to leave challenge');
    } finally {
      setJoiningId(null);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Trophy className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
          {!loading && activeTab === 'active' && (
            <p className="text-sm text-muted-foreground">
              {challenges.length} active challenges
            </p>
          )}
          {!loading && activeTab === 'all' && (
            <p className="text-sm text-muted-foreground">
              {challenges.length} total challenges
            </p>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : challenges.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onJoin={handleJoinChallenge}
                  onDrop={handleDropChallenge}
                  joiningId={joiningId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No active challenges</h3>
              <p className="text-muted-foreground">
                There are no active challenges at the moment. Check back later!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : challenges.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onJoin={handleJoinChallenge}
                  onDrop={handleDropChallenge}
                  joiningId={joiningId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
              <p className="text-muted-foreground">
                The first challenge will be available soon. Stay tuned!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
