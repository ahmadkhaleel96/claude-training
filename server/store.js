const { supabase } = require('./db');

// ── scores ─────────────────────────────────────────────────────────────────────

async function getScores() {
  const { data, error } = await supabase.from('scores').select('*').single();
  if (error) throw error;
  return { X: data.x_wins, O: data.o_wins, draws: data.draws };
}

async function updateScores(winner) {
  const scores = await getScores();
  if (winner === 'X') scores.X += 1;
  else if (winner === 'O') scores.O += 1;
  else scores.draws += 1;

  const { data, error } = await supabase
    .from('scores')
    .update({ x_wins: scores.X, o_wins: scores.O, draws: scores.draws })
    .eq('id', 1)
    .select()
    .single();
  if (error) throw error;
  return { X: data.x_wins, O: data.o_wins, draws: data.draws };
}

async function resetScores() {
  const { error } = await supabase
    .from('scores')
    .update({ x_wins: 0, o_wins: 0, draws: 0 })
    .eq('id', 1);
  if (error) throw error;
  return { X: 0, O: 0, draws: 0 };
}

// ── users ──────────────────────────────────────────────────────────────────────

async function getUser(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // no rows found
    throw error;
  }
  return { passwordHash: data.password_hash };
}

async function createUser(username, passwordHash) {
  const { error } = await supabase
    .from('users')
    .insert({ username, password_hash: passwordHash });
  if (error) throw error;
}

// ── leaderboard ────────────────────────────────────────────────────────────────

async function getLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('wins', { ascending: false });
  if (error) throw error;
  return data.map(row => ({
    username: row.username,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
  }));
}

async function _getLeaderboardEntry(username) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('username', username)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return { wins: 0, losses: 0, draws: 0 };
    throw error;
  }
  return { wins: data.wins, losses: data.losses, draws: data.draws };
}

async function updateLeaderboard(winner, users) {
  if (!users) return;
  const { X: xUser, O: oUser } = users;
  const xValid = xUser && typeof xUser === 'string' && xUser.trim().length > 0;
  const oValid = oUser && typeof oUser === 'string' && oUser.trim().length > 0;
  if (!xValid && !oValid) return;

  if (xValid) {
    const entry = await _getLeaderboardEntry(xUser);
    if (winner === 'X') entry.wins++;
    else if (winner === 'O') entry.losses++;
    else entry.draws++;
    const { error } = await supabase.from('leaderboard').upsert({
      username: xUser,
      wins: entry.wins,
      losses: entry.losses,
      draws: entry.draws,
    });
    if (error) throw error;
  }

  if (oValid) {
    const entry = await _getLeaderboardEntry(oUser);
    if (winner === 'O') entry.wins++;
    else if (winner === 'X') entry.losses++;
    else entry.draws++;
    const { error } = await supabase.from('leaderboard').upsert({
      username: oUser,
      wins: entry.wins,
      losses: entry.losses,
      draws: entry.draws,
    });
    if (error) throw error;
  }
}

async function resetLeaderboard() {
  const { error } = await supabase
    .from('leaderboard')
    .delete()
    .neq('username', '');
  if (error) throw error;
}

module.exports = {
  getScores,
  updateScores,
  resetScores,
  getUser,
  createUser,
  getLeaderboard,
  updateLeaderboard,
  resetLeaderboard,
};
