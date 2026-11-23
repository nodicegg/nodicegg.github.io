async function loadRankings() {
  const status = document.querySelector('#status');
  try {
    const response = await fetch('https://krkoydzjzrutdgxhaplk.supabase.co/rest/v1/rpc/emberwolf_leaderboard', {
      headers: { apikey: 'sb_publishable_CRUhmi4nlIgzeYsjaPtCYw_dGJpApTH' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Rankings unavailable');
    const heroes = await response.json();
    if (!heroes.length) {
      status.textContent = 'Ashgate is waiting for its first hero.';
      return;
    }
    const body = document.querySelector('tbody');
    for (const hero of heroes) {
      const row = body.insertRow();
      for (const column of ['rank', 'hero', 'class', 'level', 'xp']) {
        row.insertCell().textContent = column === 'xp' ? Number(hero.xp).toLocaleString() : hero[column];
      }
    }
    document.querySelector('.table-frame').hidden = false;
    status.textContent = '';
    status.hidden = true;
  } catch {
    status.textContent = 'Rankings are temporarily unavailable. Refresh to try again.';
  }
}
loadRankings();
