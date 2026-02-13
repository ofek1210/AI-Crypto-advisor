const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type DailyInsight = {
  text: string;
  generatedAt: string;
  source: 'ai' | 'fallback';
};

type InsightParams = {
  assetInterests?: string;
  investorType?: string;
  contentType?: string;
};

export const getDailyInsight = async (params?: InsightParams): Promise<DailyInsight> => {
  const query = new URLSearchParams();
  if (params?.assetInterests) query.set('assetInterests', params.assetInterests);
  if (params?.investorType) query.set('investorType', params.investorType);
  if (params?.contentType) query.set('contentType', params.contentType);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_URL}/api/insight/daily${suffix}`);
  if (!res.ok) {
    throw new Error('Failed to load AI insight.');
  }
  return (await res.json()) as DailyInsight;
};
