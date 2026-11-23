import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

const client = createClient('https://krkoydzjzrutdgxhaplk.supabase.co', 'sb_publishable_CRUhmi4nlIgzeYsjaPtCYw_dGJpApTH', {
  auth: { flowType: 'pkce' },
});
const status = document.querySelector('#status');
const signIn = document.querySelector('#signin');
const signOut = document.querySelector('#signout');
const sheet = document.querySelector('#sheet');
const stats = document.querySelector('#stats');

function renderHero(hero) {
  document.querySelector('#hero-name').textContent = hero.hero;
  document.querySelector('#calling').textContent = 'Level ' + hero.level + ' ' + hero.class;
  const progress = hero.ashwood_progress;
  const quest = progress == null ? 'Available' : progress === 4 ? 'Reward claimed'
    : progress === 3 ? 'Ready to claim' : progress + '/3 stalkers';
  stats.replaceChildren();
  for (const [label, value] of Object.entries({
    XP: hero.xp, Gold: hero.gold, Gear: '+' + hero.gear, 'Ashwood quest': quest,
  })) {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value;
    group.append(term, detail);
    stats.append(group);
  }
  sheet.hidden = false;
}

let renderVersion = 0;
async function refresh(session) {
  const version = ++renderVersion;
  sheet.hidden = true;
  stats.replaceChildren();
  document.querySelector('#hero-name').textContent = '';
  document.querySelector('#calling').textContent = '';
  signIn.hidden = Boolean(session);
  signOut.hidden = !session;
  if (!session) {
    status.textContent = 'Sign in with the Discord account you use to play Emberwolf in NoDiceGG.';
    return;
  }
  status.textContent = 'Loading your hero…';
  const { data, error } = await client.rpc('emberwolf_my_hero').maybeSingle();
  if (version !== renderVersion) return;
  if (error) status.textContent = 'Could not load your hero. Refresh to try again.';
  else if (!data) status.textContent = 'No hero is linked to this Discord account. Use /emberwolf begin in NoDiceGG.';
  else {
    renderHero(data);
    status.textContent = '';
  }
}

signIn.addEventListener('click', async () => {
  const redirectTo = new URL('./profile.html', location.href).href;
  const { error } = await client.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo } });
  if (error) status.textContent = 'Discord sign-in is unavailable. Try again later.';
});
signOut.addEventListener('click', async () => {
  const { error } = await client.auth.signOut({ scope: 'local' });
  if (error) status.textContent = 'Could not sign out. Try again.';
});
client.auth.onAuthStateChange((event, session) => {
  if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
    setTimeout(() => void refresh(session), 0);
  }
});
