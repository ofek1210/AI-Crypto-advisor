import type { OnboardingAnswers } from '../types/onboarding';
import type { NewsItem, PriceItem } from '../types/dashboard';

export const PRICE_META: Record<string, { name: string; logo: string }> = {
  BTC: {
    name: 'Bitcoin',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  },
  ETH: {
    name: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  SOL: {
    name: 'Solana',
    logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
  },
  USDT: {
    name: 'Tether',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  }
};

export const formatPrice = (value: number | null) => {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1 ? 2 : 4
  }).format(value);
};

export const formatChange = (value: number | null) => {
  if (value === null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const getFeaturedSymbol = (preferences?: OnboardingAnswers | null) => {
  if (!preferences?.assetInterests) return null;
  if (preferences.assetInterests === 'btc') return 'BTC';
  if (preferences.assetInterests === 'eth') return 'ETH';
  if (preferences.assetInterests === 'alts') return 'SOL';
  if (preferences.assetInterests === 'stable') return 'USDT';
  return null;
};

export const filterPricesByPreference = (
  prices: PriceItem[],
  preferences?: OnboardingAnswers | null
) => {
  if (!preferences?.assetInterests) return prices;

  if (preferences.assetInterests === 'btc') {
    return prices.filter((item) => item.symbol === 'BTC');
  }
  if (preferences.assetInterests === 'eth') {
    return prices.filter((item) => item.symbol === 'ETH');
  }
  if (preferences.assetInterests === 'alts') {
    return prices.filter((item) => item.symbol === 'SOL');
  }
  if (preferences.assetInterests === 'stable') {
    return prices.filter((item) => item.symbol === 'USDT');
  }
  if (preferences.assetInterests === 'nft') {
    return prices.filter((item) => item.symbol === 'ETH');
  }

  return prices;
};

export const splitFeaturedPrices = (
  prices: PriceItem[],
  featuredSymbol: string | null
) => {
  if (!featuredSymbol) {
    return { featured: undefined, remaining: prices };
  }

  const featured = prices.find((item) => item.symbol === featuredSymbol);
  const remaining = featured
    ? prices.filter((item) => item.symbol !== featured.symbol)
    : prices;

  return { featured, remaining };
};

const buildNewsKeywords = (preferences?: OnboardingAnswers | null) => {
  const keywords: string[] = [];

  if (preferences?.assetInterests === 'btc') keywords.push('bitcoin', 'btc');
  if (preferences?.assetInterests === 'eth') keywords.push('ethereum', 'eth');
  if (preferences?.assetInterests === 'alts') keywords.push('altcoin', 'alts', 'solana', 'sol');
  if (preferences?.assetInterests === 'stable') keywords.push('stable', 'usdt', 'tether');
  if (preferences?.assetInterests === 'nft') keywords.push('nft', 'opensea');

  if (preferences?.investorType === 'day_trader') keywords.push('trader', 'trading');
  if (preferences?.investorType === 'hodler') keywords.push('hold', 'hodl');
  if (preferences?.investorType === 'nft_collector') keywords.push('nft');
  if (preferences?.investorType === 'defi') keywords.push('defi');

  if (preferences?.contentType === 'charts') keywords.push('chart', 'technical');
  if (preferences?.contentType === 'social') keywords.push('twitter', 'x', 'reddit');
  if (preferences?.contentType === 'market_news') keywords.push('market', 'macro');
  if (preferences?.contentType === 'fun') keywords.push('meme');

  return keywords;
};

export const filterNewsByPreferences = (
  news: NewsItem[],
  preferences?: OnboardingAnswers | null
) => {
  const keywords = buildNewsKeywords(preferences);
  if (keywords.length === 0) return news;

  const filtered = news.filter((item) =>
    keywords.some((keyword) => item.title.toLowerCase().includes(keyword))
  );
  return filtered.length > 0 ? filtered : news;
};
