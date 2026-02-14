import { API_URL } from '../config/api';
import type { DashboardSummary } from '../types/dashboard';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await fetch(`${API_URL}/api/dashboard/summary`);
  if (!res.ok) {
    throw new Error('Failed to load dashboard data.');
  }
  return (await res.json()) as DashboardSummary;
};
