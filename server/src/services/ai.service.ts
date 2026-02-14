import { env } from '../config/env.js';
import { Cache } from '../utils/cache.js';

export type DailyInsight = {
  text: string;
  generatedAt: string;
  source: 'ai' | 'fallback';
};

export type InsightContext = {
  assetInterests?: string;
  investorType?: string;
  contentType?: string;
};

const cache = new Cache<DailyInsight>();
const INSIGHT_TTL_MS = 24 * 60 * 60 * 1000;
const FALLBACK_TTL_MS = 5 * 60 * 1000;

const buildPrompt = (context?: InsightContext) => {
  const parts = [];
  if (context?.assetInterests) parts.push(`assets: ${context.assetInterests}`);
  if (context?.investorType) parts.push(`investor: ${context.investorType}`);
  if (context?.contentType) parts.push(`content: ${context.contentType}`);
  const prefs = parts.length ? `User preferences: ${parts.join(', ')}.` : '';

  return `You are a crypto market assistant. ${prefs} Provide one concise daily insight (max 3 sentences), neutral and not financial advice.`;
};

export const getDailyInsight = async (context?: InsightContext): Promise<DailyInsight> => {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `insight:${today}:${context?.assetInterests || 'any'}:${
    context?.investorType || 'any'
  }:${context?.contentType || 'any'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!env.OPENROUTER_API_KEY) {
    return {
      text: 'AI insight is disabled. Add OPENROUTER_API_KEY to enable it.',
      generatedAt: new Date().toISOString(),
      source: 'fallback'
    };
  }

  const model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  try {
    const referer = env.CORS_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'AI Crypto Advisor'
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 120,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for a crypto dashboard.'
          },
          {
            role: 'user',
            content: buildPrompt(context)
          }
        ]
      })
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`OpenRouter error: ${response.status} ${details}`.trim());
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('OpenRouter returned empty response');
    }

    const result: DailyInsight = {
      text,
      generatedAt: new Date().toISOString(),
      source: 'ai'
    };

    cache.set(cacheKey, result, INSIGHT_TTL_MS);
    return result;
  } catch (error) {
    console.error('AI insight error:', error);
    const fallback: DailyInsight = {
      text: 'AI insight is unavailable right now.',
      generatedAt: new Date().toISOString(),
      source: 'fallback'
    };
    cache.set(cacheKey, fallback, FALLBACK_TTL_MS);
    return fallback;
  }
};
