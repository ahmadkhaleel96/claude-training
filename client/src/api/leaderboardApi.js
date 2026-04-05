const BASE = '/api/leaderboard';

export async function fetchLeaderboard() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function resetLeaderboard() {
  const res = await fetch(BASE, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to reset leaderboard');
  return res.json();
}
