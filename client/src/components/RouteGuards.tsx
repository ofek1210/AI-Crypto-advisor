import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../services/auth.service';
import { isOnboardingComplete } from '../services/onboarding.service';

type GuardProps = {
  children: JSX.Element;
};

export const RequireAuth = ({ children }: GuardProps) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const RequireOnboarding = ({ children }: GuardProps) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export const OnlyWhenOnboardingNeeded = ({ children }: GuardProps) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (isOnboardingComplete()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
