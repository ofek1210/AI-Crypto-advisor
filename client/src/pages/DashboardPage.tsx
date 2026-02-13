import { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  type DashboardSummary
} from '../services/dashboard.service';
import { getDailyInsight, type DailyInsight } from '../services/insight.service';
import { submitVote } from '../services/vote.service';

const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [insightError, setInsightError] = useState('');
  const [voteStatus, setVoteStatus] = useState('');

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

    load();
    loadInsight();
  }, []);

  const handleVote = async (value: 'up' | 'down') => {
    setVoteStatus('');
    try {
      await submitVote({ source: 'insight', value });
      setVoteStatus(value === 'up' ? 'Thanks for your feedback!' : 'Got it. We will improve.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vote failed.';
      setVoteStatus(message);
    }
  };

  return (
    <section className="page">
      <h1>Dashboard</h1>
      <p>Your personalized crypto overview.</p>

      {error && <div className="error">{error}</div>}

      {!data && !error && <p>Loading dashboard data...</p>}

      {data && (
        <div className="dashboard-grid">
          <div className="card">
            <h2>Prices</h2>
            <ul>
              {data.prices.map((item, index) => (
                <li key={`${item.symbol}-${index}`}>
                  <strong>{item.symbol}</strong> ${item.price ?? 'N/A'}
                  {item.change24h !== null && (
                    <span> ({item.change24h.toFixed(2)}%)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>News</h2>
            {data.news.length === 0 ? (
              <p>No news available. Add CryptoPanic token to enable.</p>
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
          </div>

          <div className="card">
            <h2>AI Insight</h2>
            {insightError && <div className="error">{insightError}</div>}
            {!insight && !insightError && <p>Loading insight...</p>}
            {insight && <p>{insight.text}</p>}
            <div className="vote-actions">
              <button className="secondary" onClick={() => handleVote('up')}>
                Helpful
              </button>
              <button className="secondary" onClick={() => handleVote('down')}>
                Not helpful
              </button>
            </div>
            {voteStatus && <div className="muted">{voteStatus}</div>}
          </div>

          <div className="card">
            <h2>Meme</h2>
            <p>{data.meme.title}</p>
            <img className="meme" src={data.meme.url} alt={data.meme.title} />
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
