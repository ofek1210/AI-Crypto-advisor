import { Request, Response } from 'express';
import * as marketService from '../services/market.service.js';
import { memes } from '../utils/memes.js';

const fallbackPrices = [
  { symbol: 'BTC', price: null, change24h: null },
  { symbol: 'ETH', price: null, change24h: null },
  { symbol: 'SOL', price: null, change24h: null }
];

export const getSummary = async (_req: Request, res: Response) => {
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

  const prices = pricesResult.status === 'fulfilled' ? pricesResult.value : fallbackPrices;
  const news = newsResult.status === 'fulfilled' ? newsResult.value : [];
  const meme =
    memeResult.status === 'fulfilled'
      ? memeResult.value
      : memes[0] || { title: 'Meme unavailable', url: '', source: 'static' };

  res.json({ prices, news, meme });
};
