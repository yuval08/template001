import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import LoadingFallback from '@/components/common/LoadingFallback';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Lazy-loaded page imports
const Login = React.lazy(() => import('@/pages/Login'));
const Callback = React.lazy(() => import('@/pages/Callback'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Forms = React.lazy(() => import('@/pages/Forms'));
const Tables = React.lazy(() => import('@/pages/Tables'));
const Users = React.lazy(() => import('@/pages/Users'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Buttons = React.lazy(() => import('@/pages/Buttons'));
const Alerts = React.lazy(() => import('@/pages/Alerts'));
const Dialogs = React.lazy(() => import('@/pages/Dialogs'));
const CardsAndBadges = React.lazy(() => import('@/pages/CardsAndBadges'));
const Inputs = React.lazy(() => import('@/pages/Inputs'));
const UIShowcase = React.lazy(() => import('@/pages/UIShowcase'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const TestNotifications = React.lazy(() => import('@/pages/TestNotifications'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Settings = React.lazy(() => import('@/pages/Settings'));

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
        element: (
          <ErrorBoundary fallback={<div>Error loading Dashboard</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'forms',
        element: (
          <ErrorBoundary fallback={<div>Error loading Forms</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Forms />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'tables',
        element: (
          <ErrorBoundary fallback={<div>Error loading Tables</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Tables />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['Admin']}>
            <ErrorBoundary fallback={<div>Error loading Users</div>}>
              <Suspense fallback={<LoadingFallback />}>
                <Users />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ErrorBoundary fallback={<div>Error loading Reports</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Reports />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'buttons',
        element: (
          <ErrorBoundary fallback={<div>Error loading Buttons</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Buttons />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'alerts',
        element: (
          <ErrorBoundary fallback={<div>Error loading Alerts</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Alerts />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'dialogs',
        element: (
          <ErrorBoundary fallback={<div>Error loading Dialogs</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Dialogs />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'cards-and-badges',
        element: (
          <ErrorBoundary fallback={<div>Error loading Cards & Badges</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <CardsAndBadges />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'inputs',
        element: (
          <ErrorBoundary fallback={<div>Error loading Inputs</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Inputs />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'ui-showcase',
        element: (
          <ErrorBoundary fallback={<div>Error loading UI Showcase</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <UIShowcase />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ErrorBoundary fallback={<div>Error loading Notifications</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Notifications />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'test-notifications',
        element: (
          <ErrorBoundary fallback={<div>Error loading Test Notifications</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <TestNotifications />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'profile',
        element: (
          <ErrorBoundary fallback={<div>Error loading Profile</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Profile />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'settings',
        element: (
          <ErrorBoundary fallback={<div>Error loading Settings</div>}>
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          </ErrorBoundary>
        ),
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