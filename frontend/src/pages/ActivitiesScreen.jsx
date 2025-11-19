import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, Plus, RefreshCw, FileText } from 'lucide-react';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { ActivityFilters } from '@/components/activities/ActivityFilters';
import { LogActivityModal } from '@/components/activities/LogActivityModal';
import { showToast } from '@/lib/utils';
import api from '@/config/api';

const INITIAL_FILTERS = {
  category: null,
  startDate: null,
  endDate: null,
  sortBy: 'date',
  order: 'desc',
  search: '',
  page: 1,
  limit: 10,
};

export const ActivitiesScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalActivities, setTotalActivities] = useState(0);
  const [hasFilters, setHasFilters] = useState(false);

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'search') {
        params.append(key, value);
      }
    });

    // Add search if present (backend may handle this differently)
    if (filters.search) {
      params.append('search', filters.search);
    }

    return params.toString();
  }, [filters]);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = buildQueryParams();
      const response = await api.get(`/activities${queryParams ? `?${queryParams}` : ''}`);

      const { activities: fetchedActivities, pagination } = response.data;
      setActivities(fetchedActivities || []);
      setTotalActivities(pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showToast.error('Failed to load activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    fetchActivities();
  }, [filters, fetchActivities]);

  useEffect(() => {
    // Check if filters are active
    const active = !!(filters.category || filters.startDate || filters.endDate || filters.search);
    setHasFilters(active);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setIsLogModalOpen(true);
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;

    try {
      await api.delete(`/activities/${deletingActivity.id}`);
      showToast.success('Activity deleted successfully');

      // Remove from local state
      setActivities(prev => prev.filter(activity => activity.id !== deletingActivity.id));
      setTotalActivities(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting activity:', error);
      showToast.error('Failed to delete activity');
    } finally {
      setDeletingActivity(null);
    }
  };

  const handleActivityLogged = () => {
    // Refresh activities
    fetchActivities();
  };

  // Reset editing state when modal closes
  const handleModalClose = (open) => {
    setIsLogModalOpen(open);
    if (!open) {
      setEditingActivity(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity History</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                {totalActivities} activities logged
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Filters */}
      <ActivityFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Results Summary */}
      {hasFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {activities.length} of {totalActivities} results
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchActivities}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      {loading ? (
        // Loading skeletons
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activities.length === 0 ? (
        // Empty state
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <Activity className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  {hasFilters ? 'No activities found' : 'No activities logged yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hasFilters
                    ? 'Try adjusting your filters to see more results.'
                    : 'Start tracking your carbon footprint by logging your first activity!'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Activity cards
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={handleEditActivity}
              onDelete={setDeletingActivity}
              showActions={true}
            />
          ))}

          {/* Pagination would go here if needed */}
        </div>
      )}

      {/* Log Activity Modal */}
      <LogActivityModal
        open={isLogModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleActivityLogged}
        editData={editingActivity}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingActivity} onOpenChange={() => setDeletingActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
              {deletingActivity && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{deletingActivity.details}</p>
                  <p className="text-sm text-muted-foreground">
                    {deletingActivity.emission.toFixed(2)} kg CO₂e • {deletingActivity.category}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
