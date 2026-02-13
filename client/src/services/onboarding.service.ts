import type { OnboardingAnswers } from '../types/onboarding';
import { getAuthToken } from './auth.service';

const COMPLETE_KEY = 'onboardingComplete';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const setOnboardingComplete = (value: boolean) => {
  localStorage.setItem(COMPLETE_KEY, value ? 'true' : 'false');
};

export const isOnboardingComplete = () =>
  localStorage.getItem(COMPLETE_KEY) === 'true';

export const fetchOnboardingStatus = async (): Promise<{
  completed: boolean;
  preferences?: OnboardingAnswers;
}> => {
  const res = await fetch(`${API_URL}/api/onboarding/me`, {
    headers: { ...authHeaders() }
  });

  if (!res.ok) {
    throw new Error('Failed to load onboarding status.');
  }

  return (await res.json()) as {
    completed: boolean;
    preferences?: OnboardingAnswers;
  };
};

export const saveOnboarding = async (answers: OnboardingAnswers) => {
  const res = await fetch(`${API_URL}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(answers)
  });

  if (!res.ok) {
    throw new Error('Failed to save onboarding.');
  }

  const payload = (await res.json()) as {
    completed: boolean;
    preferences?: OnboardingAnswers;
  };

  setOnboardingComplete(payload.completed);
  return payload;
};
