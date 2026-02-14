import * as marketService from './market.service.js';
import { memes, type Meme } from '../utils/memes.js';

type NewsItem = { title: string; url: string; source: string; publishedAt: string };

export type DashboardSummary = {
  prices: Array<{ symbol: string; price: number | null; change24h: number | null }>;
  pricesSource?: string;
  news: NewsItem[];
  meme: Meme;
};

const fallbackPrices = [
  { symbol: 'BTC', price: null, change24h: null },
  { symbol: 'ETH', price: null, change24h: null },
  { symbol: 'SOL', price: null, change24h: null }
];

const fallbackMeme: Meme =
  memes[0] || { title: 'Meme unavailable', url: '', source: 'static' };

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const [pricesResult, newsResult, memeResult] = await Promise.allSettled([
    marketService.getPrices(),
    marketService.getNews(),
    marketService.getMeme()
  ]);

  if (pricesResult.status === 'rejected') {
    console.error('Dashboard prices error:', pricesResult.reason);
  }
  if (newsResult.status === 'rejected') {
    console.error('Dashboard news error:', newsResult.reason);
  }
  if (memeResult.status === 'rejected') {
    console.error('Dashboard meme error:', memeResult.reason);
  }

  const pricesPayload =
    pricesResult.status === 'fulfilled'
      ? pricesResult.value
      : { items: fallbackPrices, source: 'fallback' };
  const prices = pricesPayload.items;
  const pricesSource = pricesPayload.source;
  const news = newsResult.status === 'fulfilled' ? newsResult.value : [];
  const meme = memeResult.status === 'fulfilled' ? memeResult.value : fallbackMeme;

  return { prices, pricesSource, news, meme };
};
