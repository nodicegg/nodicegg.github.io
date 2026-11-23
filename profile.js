import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

const client = createClient('https://krkoydzjzrutdgxhaplk.supabase.co', 'sb_publishable_CRUhmi4nlIgzeYsjaPtCYw_dGJpApTH', {
  auth: { flowType: 'pkce' },
});
const status = document.querySelector('#status');
const signIn = document.querySelector('#signin');
const signOut = document.querySelector('#signout');
const sheet = document.querySelector('#sheet');
const stats = document.querySelector('#stats');

function renderQuest(progress) {
  const journal = document.querySelector('#journal');
  if (!journal) return;
  const kills = Math.min(progress ?? 0, 3);
  let state = 'In progress';
  let next = 'Hunt an Ashwood Stalker in Discord. Each successful hunt advances the quest.';
  let command = '/emberwolf hunt';
  if (progress == null) {
    state = 'Available';
    next = 'Open the quest board and accept the quartermaster’s contract.';
    command = '/emberwolf quests';
  } else if (progress === 3) {
    state = 'Ready to claim';
    next = 'Open the quest board and choose Claim Reward.';
    command = '/emberwolf quests';
  } else if (progress === 4) {
    state = 'Reward claimed';
    next = 'Visit the forge to check your next gear upgrade.';
    command = '/emberwolf forge';
  }
  document.querySelector('#quest-state').textContent = state;
  document.querySelector('#quest-progress').value = kills;
  document.querySelector('#quest-count').textContent = kills + '/3';
  document.querySelector('#quest-next').textContent = next;
  document.querySelector('#quest-command').textContent = command;
  journal.hidden = false;
}

function renderHero(hero) {
  document.querySelector('#hero-name').textContent = hero.hero;
  document.querySelector('#calling').textContent = 'Level ' + hero.level + ' ' + hero.class;
  stats.replaceChildren();
  for (const [label, value] of Object.entries({
    XP: hero.xp, Gold: hero.gold, Gear: '+' + hero.gear,
  })) {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value;
    group.append(term, detail);
    stats.append(group);
  }
  renderQuest(hero.ashwood_progress);
  sheet.hidden = false;
}

let renderVersion = 0;
async function refresh(session) {
  const version = ++renderVersion;
  sheet.hidden = true;
  const journal = document.querySelector('#journal');
  if (journal) {
    journal.hidden = true;
    for (const id of ['quest-state', 'quest-count', 'quest-next', 'quest-command']) document.getElementById(id).textContent = '';
    document.getElementById('quest-progress').value = 0;
  }
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
