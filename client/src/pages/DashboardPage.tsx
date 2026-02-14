import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboard.service';
import { getDailyInsight, type DailyInsight } from '../services/insight.service';
import { submitVote } from '../services/vote.service';
import { fetchOnboardingStatus } from '../services/onboarding.service';
import { clearNewUserFlag, isNewUser } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import type { OnboardingAnswers } from '../types/onboarding';
import type { DashboardSummary } from '../types/dashboard';
import {
  PRICE_META,
  filterNewsByPreferences,
  filterPricesByPreference,
  formatChange,
  formatPrice,
  getFeaturedSymbol,
  splitFeaturedPrices
} from '../utils/dashboard';

const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [insightError, setInsightError] = useState('');
  const [preferences, setPreferences] = useState<OnboardingAnswers | null>(null);
  const [voteStatus, setVoteStatus] = useState<Record<string, string>>({});
  const [voteSelection, setVoteSelection] = useState<Record<string, 'up' | 'down'>>({});
  const { user, logout } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        const result = await getDashboardSummary();
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data.';
        setError(message);
      }
    };

    const loadPrefs = async () => {
      try {
        const status = await fetchOnboardingStatus();
        if (status.completed && status.preferences) {
          setPreferences(status.preferences);
        }
      } catch {
        // ignore preferences fetch errors
      }
    };

    load();
    loadPrefs();
  }, []);

  useEffect(() => {
    const name = user?.name || 'Investor';
    const message = isNewUser() ? `Welcome, ${name}` : `Welcome back, ${name}`;
    setWelcomeMessage(message);
    if (isNewUser()) {
      clearNewUserFlag();
    }
  }, [user]);

  useEffect(() => {
    const loadInsight = async () => {
      try {
        const result = await getDailyInsight({
          assetInterests: preferences?.assetInterests,
          investorType: preferences?.investorType,
          contentType: preferences?.contentType
        });
        setInsight(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load AI insight.';
        setInsightError(message);
      }
    };

    loadInsight();
  }, [preferences]);

  const handleVote = async (source: 'insight' | 'news' | 'meme' | 'prices', value: 'up' | 'down') => {
    setVoteStatus((prev) => ({ ...prev, [source]: '' }));
    setVoteSelection((prev) => ({ ...prev, [source]: value }));
    try {
      await submitVote({ source, value });
      setVoteStatus((prev) => ({
        ...prev,
        [source]: value === 'up' ? 'Thanks for your feedback!' : 'Got it. We will improve.'
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vote failed.';
      setVoteStatus((prev) => ({ ...prev, [source]: message }));
    }
  };

  const visiblePrices = data
    ? filterPricesByPreference(data.prices, preferences)
    : [];
  const featuredSymbol = getFeaturedSymbol(preferences);
  const { featured: featuredPrice, remaining: remainingPrices } = splitFeaturedPrices(
    visiblePrices,
    featuredSymbol
  );
  const visibleNews = data ? filterNewsByPreferences(data.news, preferences) : [];

  const ThumbUpIcon = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 10.5a1.5 1.5 0 0 1 1.5-1.5h3.082a.5.5 0 0 0 .39-.188l3.318-4.14A1.5 1.5 0 0 1 11.48 4H12a1 1 0 0 1 1 1v3.5a.5.5 0 0 0 .5.5h2.188a1.5 1.5 0 0 1 1.468 1.83l-1.2 5.4A1.5 1.5 0 0 1 14.49 17H7a1 1 0 0 1-1-1v-4H3.5A1.5 1.5 0 0 1 2 10.5Z" />
      <path d="M6 12v4H3.5A1.5 1.5 0 0 1 2 14.5v-3A1.5 1.5 0 0 1 3.5 10H6v2Z" />
    </svg>
  );

  const ThumbDownIcon = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M18 9.5A1.5 1.5 0 0 1 16.5 11H13.418a.5.5 0 0 0-.39.188l-3.318 4.14A1.5 1.5 0 0 1 8.52 16H8a1 1 0 0 1-1-1v-3.5a.5.5 0 0 0-.5-.5H4.312a1.5 1.5 0 0 1-1.468-1.83l1.2-5.4A1.5 1.5 0 0 1 5.51 3H13a1 1 0 0 1 1 1v4h2.5A1.5 1.5 0 0 1 18 9.5Z" />
      <path d="M14 8V4h2.5A1.5 1.5 0 0 1 18 5.5v3A1.5 1.5 0 0 1 16.5 10H14V8Z" />
    </svg>
  );

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{welcomeMessage || 'Your personalized crypto overview.'}</p>
        </div>
        <button
          className="secondary"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          Log out
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {!data && !error && <p>Loading dashboard data...</p>}

      {data && (
        <div className="dashboard-grid">
          <div className="card">
            <h2>Prices</h2>
            {featuredPrice && (
              <div className="price-featured">
                <div className="section-title">Featured Coin</div>
                <div className="price-card-top">
                  <img
                    className="price-logo"
                    src={PRICE_META[featuredPrice.symbol]?.logo}
                    alt={PRICE_META[featuredPrice.symbol]?.name}
                  />
                  <div>
                    <div className="price-name">{PRICE_META[featuredPrice.symbol]?.name}</div>
                    <div className="price-symbol">{featuredPrice.symbol}</div>
                  </div>
                </div>
                <div className="price-value">{formatPrice(featuredPrice.price)}</div>
                <div
                  className={`price-change ${
                    featuredPrice.change24h === null
                      ? 'neutral'
                      : featuredPrice.change24h >= 0
                      ? 'positive'
                      : 'negative'
                  }`}
                >
                  {formatChange(featuredPrice.change24h)}
                </div>
              </div>
            )}
            <div className="prices-grid">
              {remainingPrices.map((item, index) => {
                const meta = PRICE_META[item.symbol] || { name: item.symbol, logo: '' };
                const changeClass =
                  item.change24h === null
                    ? 'neutral'
                    : item.change24h >= 0
                    ? 'positive'
                    : 'negative';

                return (
                  <div className="price-card" key={`${item.symbol}-${index}`}>
                    <div className="price-card-top">
                      {meta.logo ? (
                        <img className="price-logo" src={meta.logo} alt={meta.name} />
                      ) : (
                        <div className="price-logo placeholder">{item.symbol}</div>
                      )}
                      <div>
                        <div className="price-name">{meta.name}</div>
                        <div className="price-symbol">{item.symbol}</div>
                      </div>
                    </div>
                    <div className="price-value">{formatPrice(item.price)}</div>
                    <div className={`price-change ${changeClass}`}>
                      {formatChange(item.change24h)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="vote-actions">
              <button
                className={`vote-button ${voteSelection.prices === 'up' ? 'active up' : ''}`}
                onClick={() => handleVote('prices', 'up')}
              >
                <ThumbUpIcon />
                Helpful
              </button>
              <button
                className={`vote-button ${voteSelection.prices === 'down' ? 'active down' : ''}`}
                onClick={() => handleVote('prices', 'down')}
              >
                <ThumbDownIcon />
                Not helpful
              </button>
            </div>
            {voteStatus.prices && <div className="muted">{voteStatus.prices}</div>}
          </div>

          <div className="card">
            <h2>News</h2>
            {visibleNews.length === 0 ? (
              <p>No news available right now.</p>
            ) : (
              <ul>
                {visibleNews.map((item, index) => (
                  <li key={`${item.url ?? 'news'}-${index}`}>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                    <div className="muted">{item.source}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="vote-actions">
              <button
                className={`vote-button ${voteSelection.news === 'up' ? 'active up' : ''}`}
                onClick={() => handleVote('news', 'up')}
              >
                <ThumbUpIcon />
                Helpful
              </button>
              <button
                className={`vote-button ${voteSelection.news === 'down' ? 'active down' : ''}`}
                onClick={() => handleVote('news', 'down')}
              >
                <ThumbDownIcon />
                Not helpful
              </button>
            </div>
            {voteStatus.news && <div className="muted">{voteStatus.news}</div>}
          </div>

          <div className="card">
            <h2>AI Insight</h2>
            {insightError && <div className="error">{insightError}</div>}
            {!insight && !insightError && <p>Loading insight...</p>}
            {insight && <p>{insight.text}</p>}
            <div className="vote-actions">
              <button
                className={`vote-button ${voteSelection.insight === 'up' ? 'active up' : ''}`}
                onClick={() => handleVote('insight', 'up')}
              >
                <ThumbUpIcon />
                Helpful
              </button>
              <button
                className={`vote-button ${voteSelection.insight === 'down' ? 'active down' : ''}`}
                onClick={() => handleVote('insight', 'down')}
              >
                <ThumbDownIcon />
                Not helpful
              </button>
            </div>
            {voteStatus.insight && <div className="muted">{voteStatus.insight}</div>}
          </div>

          <div className="card">
            <h2>Meme</h2>
            <p>{data.meme.title}</p>
            <img
              className="meme"
              src={data.meme.url}
              alt={data.meme.title}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="vote-actions">
              <button
                className={`vote-button ${voteSelection.meme === 'up' ? 'active up' : ''}`}
                onClick={() => handleVote('meme', 'up')}
              >
                <ThumbUpIcon />
                Helpful
              </button>
              <button
                className={`vote-button ${voteSelection.meme === 'down' ? 'active down' : ''}`}
                onClick={() => handleVote('meme', 'down')}
              >
                <ThumbDownIcon />
                Not helpful
              </button>
            </div>
            {voteStatus.meme && <div className="muted">{voteStatus.meme}</div>}
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
