import React from 'react';
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
import { useProjectSummary } from '@/hooks/useApi';
import { 
  TrendingUp, 
  TrendingDown,
  ClipboardList,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  const { data: summaryResponse, isLoading, error } = useProjectSummary();
  const summary = summaryResponse?.data;

  // Mock data for charts (in real app, this would come from API)
  const projectStatusData = [
    { name: 'Active', value: summary?.activeProjects || 12, color: '#10b981' },
    { name: 'Completed', value: summary?.completedProjects || 8, color: '#3b82f6' },
    { name: 'Paused', value: summary?.pausedProjects || 3, color: '#f59e0b' },
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
    { id: 1, action: 'New project created', user: 'John Doe', time: '2 minutes ago', type: 'create' },
    { id: 2, action: 'Project status updated', user: 'Jane Smith', time: '5 minutes ago', type: 'update' },
    { id: 3, action: 'User added to project', user: 'Mike Johnson', time: '10 minutes ago', type: 'assign' },
    { id: 4, action: 'Report generated', user: 'Sarah Wilson', time: '15 minutes ago', type: 'report' },
    { id: 5, action: 'Project completed', user: 'David Brown', time: '30 minutes ago', type: 'complete' },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading dashboard data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your projects and activity with interactive charts and statistics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : formatNumber(summary?.totalProjects || 23)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : formatNumber(summary?.activeProjects || 12)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                {formatPercentage((summary?.activeProjects || 12) / (summary?.totalProjects || 23))} of total
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : formatNumber(summary?.completedProjects || 8)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% completion rate
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : formatNumber(summary?.pausedProjects || 3)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>
              Current breakdown of projects by status
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
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>
              Project activity over the last 6 months
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
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
            <CardTitle>Monthly Comparison</CardTitle>
            <CardDescription>
              Comparison of projects created vs completed over time
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
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar dataKey="projects" fill="url(#projectsGradient)" name="Created" radius={[8, 8, 0, 0]} animationDuration={1000} />
                  <Bar dataKey="completed" fill="url(#completedGradient)" name="Completed" radius={[8, 8, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions in your workspace
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
                      by {activity.user}
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
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>
            User registration and engagement over time
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
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;