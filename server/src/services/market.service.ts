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

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        url?: string;
        url_overridden_by_dest?: string;
        over_18?: boolean;
        preview?: {
          images?: Array<{
            source?: { url?: string };
          }>;
        };
      };
    }>;
  };
};

type CoinCapResponse = {
  data: Array<{
    id: string;
    symbol: string;
    priceUsd: string;
    changePercent24Hr: string;
  }>;
};

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';
const COINCAP_URL = 'https://api.coincap.io/v2';
const CRYPTOPANIC_URL = 'https://cryptopanic.com/api/developer/v2/posts/';
const REDDIT_URL = 'https://www.reddit.com/r/cryptomemes/top.json?limit=30&t=day&raw_json=1';

type PriceItem = { symbol: string; price: number | null; change24h: number | null };
type PriceSource = 'coingecko' | 'coincap' | 'last_known' | 'fallback' | 'cache';
export type PriceResult = { items: PriceItem[]; source: PriceSource };

const cache = new Cache<any>();
let lastPrices: PriceItem[] | null = null;
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

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new AppError(`External API error: ${res.status}`, 502);
  }
  return (await res.json()) as T;
};

const mapCoinCapPrices = (payload: CoinCapResponse) =>
  payload.data.map((item) => ({
    symbol: item.symbol.toUpperCase(),
    price: Number(item.priceUsd),
    change24h: Number(item.changePercent24Hr)
  }));

const sanitizeUrl = (value?: string) => (value ? value.replace(/&amp;/g, '&') : '');

const isAllowedHost = (url: string) =>
  url.includes('i.redd.it') || url.includes('preview.redd.it');

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(url);

const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const getPrices = async (): Promise<PriceResult> => {
  const disableCache = env.DISABLE_PRICE_CACHE === 'true';
  if (!disableCache) {
    const cached = cache.get('prices');
    if (cached) {
      if (Array.isArray(cached)) {
        return { items: cached, source: 'cache' };
      }
      if (cached.items && Array.isArray(cached.items)) {
        return cached as PriceResult;
      }
    }
  }

  try {
    const coingeckoHeaders: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'AI-Crypto-Advisor/1.0'
    };
    if (env.COINGECKO_API_KEY) {
      // Support both Demo and Pro keys (CoinGecko accepts one of these)
      coingeckoHeaders['x-cg-pro-api-key'] = env.COINGECKO_API_KEY;
      coingeckoHeaders['x-cg-demo-api-key'] = env.COINGECKO_API_KEY;
    }
    const url = `${COINGECKO_URL}/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd&include_24hr_change=true`;
    const data = await fetchJson<PriceResponse>(url, { headers: coingeckoHeaders });

    const result: PriceItem[] = [
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

    const payload: PriceResult = { items: result, source: 'coingecko' };
    lastPrices = result;
    if (!disableCache) {
      cache.set('prices', payload, 5 * 60 * 1000);
    }
    return payload;
  } catch (err) {
    console.error('CoinGecko error:', err);
    try {
      const url = `${COINCAP_URL}/assets?ids=bitcoin,ethereum,solana,tether`;
      const data = await fetchJson<CoinCapResponse>(url);
      const result = mapCoinCapPrices(data);
      const payload: PriceResult = { items: result, source: 'coincap' };
      lastPrices = result;
      if (!disableCache) {
        cache.set('prices', payload, 5 * 60 * 1000);
      }
      return payload;
    } catch (err2) {
      console.error('CoinCap error:', err2);
      // fall through to last-known or static fallback
    }

    if (lastPrices && lastPrices.length > 0) {
      const payload: PriceResult = { items: lastPrices, source: 'last_known' };
      if (!disableCache) {
        cache.set('prices', payload, 2 * 60 * 1000);
      }
      return payload;
    }
    const fallback: PriceItem[] = [
      { symbol: 'BTC', price: 30000, change24h: 0 },
      { symbol: 'ETH', price: 1800, change24h: 0 },
      { symbol: 'SOL', price: 120, change24h: 0 },
      { symbol: 'USDT', price: 1, change24h: 0 }
    ];
    const payload: PriceResult = { items: fallback, source: 'fallback' };
    if (!disableCache) {
      cache.set('prices', payload, 2 * 60 * 1000);
    }
    return payload;
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
  try {
    const data = await fetchJson<RedditListing>(REDDIT_URL, {
      headers: {
        'User-Agent': 'AI-Crypto-Advisor/1.0'
      }
    });

    const posts =
      data.data?.children
        ?.map((child) => child.data)
        .filter((post) => post && !post.over_18)
        .map((post) => ({
          title: post?.title || 'Crypto Meme',
          url: sanitizeUrl(post?.preview?.images?.[0]?.source?.url) || sanitizeUrl(post?.url_overridden_by_dest) || ''
        }))
        .filter((post) => post.url && isAllowedHost(post.url) && isImageUrl(post.url)) || [];

    if (posts.length > 0) {
      const picked = pickRandom(posts);
      return { title: picked.title, url: picked.url, source: 'reddit' };
    }
  } catch {
    // fall back to static memes
  }

  const index = Math.floor(Math.random() * memes.length);
  return memes[index];
};
