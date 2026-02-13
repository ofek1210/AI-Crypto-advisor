const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type PriceItem = {
  symbol: string;
  price: number | null;
  change24h: number | null;
};

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

export type MemeItem = {
  title: string;
  url: string;
  source: string;
};

export type DashboardSummary = {
  prices: PriceItem[];
  news: NewsItem[];
  meme: MemeItem;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await fetch(`${API_URL}/api/dashboard/summary`);
  if (!res.ok) {
    throw new Error('Failed to load dashboard data.');
  }
  return (await res.json()) as DashboardSummary;
};
