import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';
import { memes, type Meme } from '../utils/memes.js';
import { Cache } from '../utils/cache.js';

type PriceResponse = {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
};

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';
const CRYPTOPANIC_URL = 'https://cryptopanic.com/api/developer/v2/posts/';

const cache = new Cache<any>();
let lastPrices: Array<{ symbol: string; price: number | null; change24h: number | null }> | null =
  null;
let lastNews: NewsItem[] | null = null;

const fallbackNews: NewsItem[] = [
  {
    title: 'Crypto markets digest: key moves to watch',
    url: 'https://cryptopanic.com/',
    source: 'Static',
    publishedAt: new Date().toISOString()
  },
  {
    title: 'On-chain activity snapshot and sentiment check',
    url: 'https://cryptopanic.com/',
    source: 'Static',
    publishedAt: new Date().toISOString()
  }
];

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new AppError(`External API error: ${res.status}`, 502);
  }
  return (await res.json()) as T;
};

export const getPrices = async () => {
  const cached = cache.get('prices');
  if (cached) return cached;

  try {
    const url = `${COINGECKO_URL}/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd&include_24hr_change=true`;
    const data = await fetchJson<PriceResponse>(url);

    const result = [
      {
        symbol: 'BTC',
        price: data.bitcoin?.usd ?? null,
        change24h: data.bitcoin?.usd_24h_change ?? null
      },
      {
        symbol: 'ETH',
        price: data.ethereum?.usd ?? null,
        change24h: data.ethereum?.usd_24h_change ?? null
      },
      {
        symbol: 'SOL',
        price: data.solana?.usd ?? null,
        change24h: data.solana?.usd_24h_change ?? null
      },
      {
        symbol: 'USDT',
        price: data.tether?.usd ?? null,
        change24h: data.tether?.usd_24h_change ?? null
      }
    ];

    lastPrices = result;
    cache.set('prices', result, 5 * 60 * 1000);
    return result;
  } catch {
    if (lastPrices) {
      cache.set('prices', lastPrices, 2 * 60 * 1000);
      return lastPrices;
    }
    cache.set('prices', lastPrices || [], 2 * 60 * 1000);
    return [
      { symbol: 'BTC', price: null, change24h: null },
      { symbol: 'ETH', price: null, change24h: null },
      { symbol: 'SOL', price: null, change24h: null },
      { symbol: 'USDT', price: null, change24h: null }
    ];
  }
};

export const getNews = async (): Promise<NewsItem[]> => {
  const cached = cache.get('news');
  if (cached) return cached;

  if (!env.CRYPTOPANIC_TOKEN) {
    return fallbackNews;
  }

  try {
    const url = `${CRYPTOPANIC_URL}?auth_token=${env.CRYPTOPANIC_TOKEN}&public=true&kind=news`;
    const data = await fetchJson<{ results: Array<any> }>(url);

    const result = data.results.slice(0, 6).map((item) => ({
      title: item.title,
      url: item.url,
      source: item.source?.title || 'CryptoPanic',
      publishedAt: item.published_at
    }));

    lastNews = result;
    cache.set('news', result, 15 * 60 * 1000);
    return result;
  } catch {
    if (lastNews) {
      cache.set('news', lastNews, 5 * 60 * 1000);
      return lastNews;
    }
    cache.set('news', fallbackNews, 5 * 60 * 1000);
    return fallbackNews;
  }
};

export const getMeme = async (): Promise<Meme> => {
  const index = Math.floor(Math.random() * memes.length);
  return memes[index];
};
