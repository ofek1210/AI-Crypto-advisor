import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import {
  OnlyWhenOnboardingNeeded,
  RequireOnboarding
} from './components/RouteGuards.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        path: 'onboarding',
        element: (
          <OnlyWhenOnboardingNeeded>
            <OnboardingPage />
          </OnlyWhenOnboardingNeeded>
        )
      },
      {
        path: 'dashboard',
        element: (
          <RequireOnboarding>
            <DashboardPage />
          </RequireOnboarding>
        )
      }
    ]
  }
]);
