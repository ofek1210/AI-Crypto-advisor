const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type VoteInput = {
  source: 'insight' | 'news' | 'meme' | 'dashboard';
  value: 'up' | 'down';
};

export const submitVote = async (payload: VoteInput) => {
  const res = await fetch(`${API_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Failed to submit vote.');
  }

  return (await res.json()) as { id: string; source: string; value: string };
};
