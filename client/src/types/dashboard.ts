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
