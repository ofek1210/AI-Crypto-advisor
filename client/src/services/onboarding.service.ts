import type { OnboardingAnswers } from '../types/onboarding';

const ANSWERS_KEY = 'onboardingAnswers';
const COMPLETE_KEY = 'onboardingComplete';

export const saveOnboarding = async (answers: OnboardingAnswers) => {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  localStorage.setItem(COMPLETE_KEY, 'true');
  return { ok: true };
};

export const isOnboardingComplete = () =>
  localStorage.getItem(COMPLETE_KEY) === 'true';
