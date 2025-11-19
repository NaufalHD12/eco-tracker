import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Target, Leaf, LogOut, Edit2, Key, Trophy, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/lib/utils';
import api from '@/config/api';

export const ProfileScreen = () => {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    targetEmission: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/profile');
      const userData = response.data.user;
      setProfile(userData);
      setProfileForm({
        name: userData.name,
        targetEmission: userData.targetEmission || '',
      });
      // Update auth context if needed
      if (!user || (userData.name !== user.name || userData.targetEmission !== user.targetEmission)) {
        updateUser(userData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast.error('Failed to load profile data');
    }
  }, [user, updateUser]);

  // Fetch quiz statistics
  const fetchQuizStats = useCallback(async () => {
    try {
      const response = await api.get('/quizzes/stats/user');
      setQuizStats(response.data);
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      // Quiz stats are optional, so don't show error
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchQuizStats()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchProfile, fetchQuizStats]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const updateData = {};
      if (profileForm.name !== profile.name) updateData.name = profileForm.name;
      if (profileForm.targetEmission !== profile.targetEmission) {
        updateData.targetEmission = parseFloat(profileForm.targetEmission) || 0;
      }

      if (Object.keys(updateData).length === 0) {
        setEditMode(false);
        return;
      }

      const response = await api.put('/profile', updateData);
      const updatedUser = response.data.user;
      setProfile(updatedUser);
      updateUser(updatedUser);
      setEditMode(false);
      showToast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      showToast.error(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showToast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      showToast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to login again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button
            variant={editMode ? "destructive" : "outline"}
            size="sm"
            onClick={() => {
              if (editMode) {
                setProfileForm({
                  name: profile.name,
                  targetEmission: profile.targetEmission || '',
                });
                setEditMode(false);
              } else {
                setEditMode(true);
              }
            }}
          >
            {editMode ? 'Cancel' : (
              <>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editMode ? (
            // Edit Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetEmission">Monthly Emission Target (kg CO₂e)</Label>
                <Input
                  id="targetEmission"
                  type="number"
                  min="0"
                  step="0.1"
                  value={profileForm.targetEmission}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, targetEmission: e.target.value }))}
                  placeholder="100"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            // Display Info
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-lg font-medium">{profile.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm font-medium text-muted-foreground">Monthly Target</Label>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {profile.targetEmission ? `${profile.targetEmission} kg` : 'Not set'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <Label className="text-sm font-medium text-muted-foreground">Current Emission</Label>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {profile.totalEmission?.toFixed(1) || 0} kg
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-medium text-muted-foreground">Trees Planted</Label>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {profile.totalTrees || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="w-full"
            >
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Statistics */}
      {quizStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Quiz Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{quizStats.statistics?.totalAttempts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{quizStats.statistics?.averageScore?.toFixed(1) || 0}</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{quizStats.statistics?.averagePercentage?.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground">Avg Percentage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{quizStats.statistics?.passedCount || 0}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
            </div>

            {quizStats.statistics?.highestScore > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Highest Score: {quizStats.statistics.highestScore}</span>
              </div>
            )}

            {quizStats.statistics?.totalTimeSpent > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg mt-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Total Time: {formatTime(quizStats.statistics.totalTimeSpent)}</span>
              </div>
            )}

            {quizStats.recentAttempts && quizStats.recentAttempts.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium mb-3">Recent Quizzes</h4>
                  <div className="space-y-2">
                    {quizStats.recentAttempts.slice(0, 3).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium truncate">{attempt.quiz?.title || 'Unknown Quiz'}</span>
                        <Badge variant={attempt.grade === 'A' || attempt.grade === 'B' ? 'default' : 'secondary'}>
                          {attempt.score}/{attempt.quiz?.totalPoints || 0} ({attempt.percentage.toFixed(1)}%)
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
