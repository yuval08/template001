import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectSummary } from '@/entities/project';
import { 
  TrendingUp, 
  TrendingDown,
  ClipboardList,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { DashboardSkeleton } from '@/components/skeletons';
import { PageLayout, MetricCard } from '@/components/common';

const Dashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { data: summaryResponse, isLoading, error } = useProjectSummary();
  const summary = summaryResponse?.data;

  // Mock data for charts (in real app, this would come from API)
  const projectStatusData = [
    { name: t('status_labels.active'), value: summary?.activeProjects || 12, color: '#10b981' },
    { name: t('status_labels.completed'), value: summary?.completedProjects || 8, color: '#2563eb' },
    { name: t('status_labels.paused'), value: summary?.pausedProjects || 3, color: '#f59e0b' },
  ];

  const activityData = summary?.recentActivity || [
    { date: '2024-01', count: 15 },
    { date: '2024-02', count: 22 },
    { date: '2024-03', count: 18 },
    { date: '2024-04', count: 25 },
    { date: '2024-05', count: 32 },
    { date: '2024-06', count: 28 },
  ];

  const monthlyData = [
    { month: 'Jan', projects: 15, completed: 12, users: 145 },
    { month: 'Feb', projects: 22, completed: 18, users: 152 },
    { month: 'Mar', projects: 18, completed: 15, users: 148 },
    { month: 'Apr', projects: 25, completed: 20, users: 160 },
    { month: 'May', projects: 32, completed: 25, users: 175 },
    { month: 'Jun', projects: 28, completed: 22, users: 182 },
  ];

  const recentActivities = [
    { id: 1, action: t('recent_activity.actions.new_project_created'), user: 'John Doe', time: t('recent_activity.time.minutes_ago', { count: 2 }), type: 'create' },
    { id: 2, action: t('recent_activity.actions.project_status_updated'), user: 'Jane Smith', time: t('recent_activity.time.minutes_ago', { count: 5 }), type: 'update' },
    { id: 3, action: t('recent_activity.actions.user_added_to_project'), user: 'Mike Johnson', time: t('recent_activity.time.minutes_ago', { count: 10 }), type: 'assign' },
    { id: 4, action: t('recent_activity.actions.report_generated'), user: 'Sarah Wilson', time: t('recent_activity.time.minutes_ago', { count: 15 }), type: 'report' },
    { id: 5, action: t('recent_activity.actions.project_completed'), user: 'David Brown', time: t('recent_activity.time.minutes_ago', { count: 30 }), type: 'complete' },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading dashboard data: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageLayout
      title={t('title')}
      description={t('subtitle')}
      maxWidth="6xl"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('metrics.total_projects')}
          value={formatNumber(summary?.totalProjects || 23)}
          icon={ClipboardList}
          trend={{
            value: t('trends.from_last_month', { value: '+12%' }),
            type: "positive",
            icon: TrendingUp,
          }}
          animationDelay="0.1s"
          loading={isLoading}
        />

        <MetricCard
          title={t('metrics.active_projects')}
          value={formatNumber(summary?.activeProjects || 12)}
          icon={Activity}
          description={`${formatPercentage((summary?.activeProjects || 12) / (summary?.totalProjects || 23))} ${t('metrics.of_total')}`}
          animationDelay="0.2s"
          loading={isLoading}
        />

        <MetricCard
          title={t('metrics.completed_projects')}
          value={formatNumber(summary?.completedProjects || 8)}
          icon={CheckCircle}
          trend={{
            value: `+5% ${t('trends.completion_rate')}`,
            type: "positive",
            icon: TrendingUp,
          }}
          animationDelay="0.3s"
          loading={isLoading}
        />

        <MetricCard
          title={t('metrics.on_hold')}
          value={formatNumber(summary?.pausedProjects || 3)}
          icon={Clock}
          trend={{
            value: t('trends.from_last_month', { value: '-2%' }),
            type: "negative",
            icon: TrendingDown,
          }}
          animationDelay="0.4s"
          loading={isLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>{t('charts.project_status_distribution.title')}</CardTitle>
            <CardDescription>
              {t('charts.project_status_distribution.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>{t('charts.monthly_activity.title')}</CardTitle>
            <CardDescription>
              {t('charts.monthly_activity.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      });
                    }}
                  />
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    fill="url(#areaGradient)" 
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison */}
        <Card className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle>{t('charts.monthly_comparison.title')}</CardTitle>
            <CardDescription>
              {t('charts.monthly_comparison.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <defs>
                    <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar dataKey="projects" fill="url(#projectsGradient)" name={t('charts.monthly_comparison.created')} radius={[8, 8, 0, 0]} animationDuration={1000} />
                  <Bar dataKey="completed" fill="url(#completedGradient)" name={t('charts.monthly_comparison.completed')} radius={[8, 8, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle>{t('recent_activity.title')}</CardTitle>
            <CardDescription>
              {t('recent_activity.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'create' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'assign' ? 'bg-purple-500' :
                      activity.type === 'report' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('recent_activity.by')} {activity.user}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('charts.user_growth.title')}</CardTitle>
          <CardDescription>
            {t('charts.user_growth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name={t('charts.user_growth.active_users')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Dashboard;