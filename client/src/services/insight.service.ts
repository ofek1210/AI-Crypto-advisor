const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type DailyInsight = {
  text: string;
  generatedAt: string;
  source: 'ai' | 'fallback';
};

export const getDailyInsight = async (): Promise<DailyInsight> => {
  const res = await fetch(`${API_URL}/api/insight/daily`);
  if (!res.ok) {
    throw new Error('Failed to load AI insight.');
  }
  return (await res.json()) as DailyInsight;
};
