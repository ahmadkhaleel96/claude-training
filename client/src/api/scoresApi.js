const BASE = '/api/scores';

export async function fetchScores() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch scores');
  return res.json();
}

export async function postScore(winner, options = {}) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ winner, ...options }),
  });
  if (!res.ok) throw new Error('Failed to save score');
  return res.json();
}

export async function resetScores() {
  const res = await fetch(BASE, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to reset scores');
  return res.json();
}
