import { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  type DashboardSummary
} from '../services/dashboard.service';
import { getDailyInsight, type DailyInsight } from '../services/insight.service';
import { submitVote } from '../services/vote.service';
import { fetchOnboardingStatus } from '../services/onboarding.service';
import { clearNewUserFlag, getAuthUser, isNewUser, logoutUser } from '../services/auth.service';
import type { OnboardingAnswers } from '../types/onboarding';

const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [insightError, setInsightError] = useState('');
  const [preferences, setPreferences] = useState<OnboardingAnswers | null>(null);
  const [voteStatus, setVoteStatus] = useState<Record<string, string>>({});
  const user = getAuthUser();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const priceMeta: Record<
    string,
    { name: string; logo: string }
  > = {
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

    const loadInsight = async () => {
      try {
        const result = await getDailyInsight();
        setInsight(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load AI insight.';
        setInsightError(message);
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
    loadInsight();
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

  const handleVote = async (source: 'insight' | 'news' | 'meme' | 'prices', value: 'up' | 'down') => {
    setVoteStatus((prev) => ({ ...prev, [source]: '' }));
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

  const filteredPrices = data?.prices.filter((item) => {
    const interest = preferences?.assetInterests;
    if (!interest) return true;
    if (interest === 'btc') return item.symbol === 'BTC';
    if (interest === 'eth') return item.symbol === 'ETH';
    if (interest === 'alts') return item.symbol === 'SOL';
    if (interest === 'stable') return item.symbol === 'USDT';
    if (interest === 'nft') return item.symbol === 'ETH';
    return true;
  });

  const formatPrice = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 1 ? 2 : 4
    }).format(value);
  };

  const formatChange = (value: number | null) => {
    if (value === null) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

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
            logoutUser();
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
            <div className="prices-grid">
              {(filteredPrices || []).map((item, index) => {
                const meta = priceMeta[item.symbol] || { name: item.symbol, logo: '' };
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
              <button className="secondary" onClick={() => handleVote('prices', 'up')}>
                Helpful
              </button>
              <button className="secondary" onClick={() => handleVote('prices', 'down')}>
                Not helpful
              </button>
            </div>
            {voteStatus.prices && <div className="muted">{voteStatus.prices}</div>}
          </div>

          <div className="card">
            <h2>News</h2>
            {data.news.length === 0 ? (
              <p>No news available right now.</p>
            ) : (
              <ul>
                {data.news.map((item, index) => (
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
              <button className="secondary" onClick={() => handleVote('news', 'up')}>
                Helpful
              </button>
              <button className="secondary" onClick={() => handleVote('news', 'down')}>
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
              <button className="secondary" onClick={() => handleVote('insight', 'up')}>
                Helpful
              </button>
              <button className="secondary" onClick={() => handleVote('insight', 'down')}>
                Not helpful
              </button>
            </div>
            {voteStatus.insight && <div className="muted">{voteStatus.insight}</div>}
          </div>

          <div className="card">
            <h2>Meme</h2>
            <p>{data.meme.title}</p>
            <img className="meme" src={data.meme.url} alt={data.meme.title} />
            <div className="vote-actions">
              <button className="secondary" onClick={() => handleVote('meme', 'up')}>
                Helpful
              </button>
              <button className="secondary" onClick={() => handleVote('meme', 'down')}>
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
