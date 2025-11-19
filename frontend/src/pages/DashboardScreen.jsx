import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LayoutDashboard, Target, Zap, TreePine, TrendingUp, TrendingDown, Leaf } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '@/config/api';
import { showToast } from '@/lib/utils';

export const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/dashboard?period=${selectedPeriod}`);
        // Backend returns { message, dashboard: {...} }
        // Frontend expects the dashboard object directly
        setDashboardData(response.data.dashboard);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast.error('Failed to load dashboard data');
        // Set default empty data to prevent undefined errors
        setDashboardData({
          summary: {
            totalEmission: 0,
            targetEmission: 0,
            dailyAverage: 0,
            totalTrees: 0,
          },
          chartData: { labels: [], data: [] },
          categoryBreakdown: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  const getProgressValue = (current, target) => {
    if (!target || !current) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // Prepare chart data for Recharts
  const prepareChartData = () => {
    if (!dashboardData?.chartData?.labels || !dashboardData?.chartData?.data) {
      return [];
    }

    return dashboardData.chartData.labels.map((label, index) => ({
      date: selectedPeriod === 'yearly' ?
        label : // 'Jan', 'Feb', etc for yearly
        new Date(label).toLocaleDateString('en-US', { weekday: 'short' }), // 'Mon', 'Tue' for weekly/monthly
      emission: dashboardData.chartData.data[index] || 0,
    }));
  };

  const preparePieData = () => {
    if (!dashboardData?.categoryBreakdown) return [];

    // Color palette for categories
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'];

    return dashboardData.categoryBreakdown.map((category, index) => ({
      name: category.category,
      value: category.total,
      percentage: category.percentage,
      fill: colors[index % colors.length],
    }));
  };

  const chartData = prepareChartData();
  const pieData = preparePieData();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border p-2 rounded-lg shadow-md">
          <p className="text-sm font-medium">{`${label}`}</p>
          <p className="text-sm text-muted-foreground">
            {`Emission: ${Number(data.value).toFixed(1)} kg CO2e`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading charts...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Charts and visualizations will appear after data is loaded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary } = dashboardData;
  const summaryCards = [
    {
      title: 'Total Emission',
      value: `${summary.totalEmission} kg CO2e`,
      subtitle: `${selectedPeriod}`,
      icon: TrendingUp,
      trend: summary.totalEmission > summary.targetEmission ? 'danger' : 'good',
    },
    {
      title: 'Target Emission',
      value: `${summary.targetEmission} kg CO2e`,
      subtitle: 'Monthly goal',
      icon: Target,
      trend: 'neutral',
    },
    {
      title: 'Daily Average',
      value: `${summary.dailyAverage.toFixed(1)} kg CO2e`,
      subtitle: 'Per day average',
      icon: Zap,
      trend: summary.dailyAverage > (summary.targetEmission / 30) ? 'warning' : 'good',
    },
    {
      title: 'Trees Planted',
      value: `${summary.totalTrees}`,
      subtitle: 'Carbon offset',
      icon: Leaf,
      trend: 'good',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                Data for {selectedPeriod} period
              </p>
            )}
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex space-x-2">
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const isFirstCard = index === 0;
          const progressValue = isFirstCard ? getProgressValue(summary.totalEmission, summary.targetEmission) : null;

          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{card.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  {card.trend !== 'neutral' && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {card.trend === 'good' ? (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      ) : card.trend === 'danger' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : null}
                    </Badge>
                  )}
                </div>

                {/* Progress Ring for First Card */}
                {isFirstCard && progressValue !== null && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span>Progress to target</span>
                      <span>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress
                      value={progressValue}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emission Trend Bar Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emission Trend ({selectedPeriod})</h3>
              <div className="h-64 min-h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256} minWidth={300} minHeight={256}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        fontSize={12}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        fontSize={12}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'kg CO2e', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="emission"
                        fill="hsl(140, 69%, 51%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted/20 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No data available for {selectedPeriod}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Category Breakdown</h3>
              <div className="h-64 min-h-64 w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={256} minWidth={300} minHeight={256}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        fontSize={11}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${Number(value).toFixed(1)} kg CO2e`, 'Emission']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-muted/20 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No category data available</p>
                  </div>
                )}
              </div>

              {/* Legend */}
              {pieData.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.slice(0, 4).map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.name}: {entry.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
