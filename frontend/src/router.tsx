import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Callback from '@/pages/Callback';
import Dashboard from '@/pages/Dashboard';
import Forms from '@/pages/Forms';
import Tables from '@/pages/Tables';
import Users from '@/pages/Users';
import Reports from '@/pages/Reports';
import Buttons from '@/pages/Buttons';
import Alerts from '@/pages/Alerts';
import Dialogs from '@/pages/Dialogs';
import CardsAndBadges from '@/pages/CardsAndBadges';
import Inputs from '@/pages/Inputs';
import UIShowcase from '@/pages/UIShowcase';
import Notifications from '@/pages/Notifications';
import TestNotifications from '@/pages/TestNotifications';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/callback',
    element: <Callback />,
  },
  {
    path: '/auth/error',
    element: <Callback />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'forms',
        element: <Forms />,
      },
      {
        path: 'tables',
        element: <Tables />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['Admin']}>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'buttons',
        element: <Buttons />,
      },
      {
        path: 'alerts',
        element: <Alerts />,
      },
      {
        path: 'dialogs',
        element: <Dialogs />,
      },
      {
        path: 'cards-and-badges',
        element: <CardsAndBadges />,
      },
      {
        path: 'inputs',
        element: <Inputs />,
      },
      {
        path: 'ui-showcase',
        element: <UIShowcase />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'test-notifications',
        element: <TestNotifications />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);