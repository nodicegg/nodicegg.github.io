import { clearEquipment, renderEquipment } from './profile-equipment.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

const client = createClient('https://krkoydzjzrutdgxhaplk.supabase.co', 'sb_publishable_CRUhmi4nlIgzeYsjaPtCYw_dGJpApTH', {
  auth: { flowType: 'pkce' },
});
const status = document.querySelector('#status');
const signIn = document.querySelector('#signin');
const signOut = document.querySelector('#signout');
const sheet = document.querySelector('#sheet');
const stats = document.querySelector('#stats');

const questFilter = document.querySelector('#quest-filter');
let questProgress;
let lineStage;
let towerProgress;
let towerUnlocked;
let fenProgress;
let fenUnlocked;
function applyQuestFilter() {
  const entry = document.querySelector('#quest-entry');
  const empty = document.querySelector('#quest-empty');
  const showCompleted = (questFilter.querySelector('input:checked')?.value ?? questFilter.value) === 'completed';
  entry.hidden = showCompleted !== (questProgress === 4);
  const line = document.querySelector('#ashgate-entry');
  if (line) line.hidden = questProgress !== 4 || lineStage == null || showCompleted !== (lineStage === 3);
  const tower = document.querySelector('#watchtower-entry');
  if (tower) tower.hidden = !towerUnlocked || showCompleted !== (towerProgress === 4);
  const fen = document.querySelector('#cinderfen-entry');
  if (fen) fen.hidden = !fenUnlocked || showCompleted !== (fenProgress === 4);
  empty.hidden = [entry, line, tower, fen].some(card => card && !card.hidden);
  empty.textContent = !empty.hidden ? (showCompleted ? 'No completed quests yet.' : 'No open quests.') : '';
}
questFilter?.addEventListener('change', applyQuestFilter);

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
  questProgress = progress;
  if (questFilter) applyQuestFilter();
  journal.hidden = false;
}

function renderHero(hero) {
  for (const [id, value, max] of [['hero-hp', hero.hp, hero.max_hp ?? 40], ['hero-mp', hero.mp, hero.max_mp ?? 20]]) {
    const element = document.getElementById(id);
    if (element) element.textContent = value == null ? 'Unavailable' : value + '/' + max;
  }
  document.querySelector('#hero-name').textContent = hero.hero;
  document.querySelector('#calling').textContent = 'Level ' + hero.level + ' ' + hero.class;
  stats.replaceChildren();
  for (const [label, value] of Object.entries({
    Strength: hero.strength ?? '—', Agility: hero.agility ?? '—', Intellect: hero.intellect ?? '—',
    Stamina: hero.stamina ?? '—', Spirit: hero.spirit ?? '—',
    'Raid crit': hero.crit_chance == null ? '—' : hero.crit_chance + '%',
    'Mana recovery': hero.spirit == null ? '—' : hero.spirit + ' MP/min',
    Power: hero.power ?? 'Unavailable', Guard: hero.guard ?? 'Unavailable', XP: hero.xp, Gold: hero.gold, Gear: '+' + hero.gear,
    Trinket: hero.charm_equipped ? 'Cinderfang Charm (+1 Power)' : hero.charm_owned ? 'Cinderfang Charm (in pack)' : 'Empty',
  })) {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value;
    group.append(term, detail);
    stats.append(group);
  }
  lineStage = hero.ashgate_stage;
  const checklist = document.querySelector('#ashgate-objectives');
  if (checklist) {
    checklist.replaceChildren();
    for (const [done, label] of [[hero.gear >= 1, 'Upgrade gear to +1'], [lineStage >= 1, 'Rest at camp after gearing up'], [lineStage >= 2, 'Land a strike on Cindermaw']]) {
      const item = document.createElement('li');
      item.textContent = (done ? 'Done · ' : 'To do · ') + label;
      checklist.append(item);
    }
    document.querySelector('#ashgate-next').textContent = lineStage === 3 ? 'Reward claimed.'
      : lineStage === 2 ? 'Use /emberwolf quests to claim your reward.'
      : hero.gear < 1 ? 'Use /emberwolf forge to upgrade your gear.'
      : lineStage === 0 ? 'Use /emberwolf rest to recover at camp.'
      : 'Use /emberwolf raid to strike Cindermaw.';
  }
  towerUnlocked = hero.level >= 3;
  towerProgress = hero.watchtower_progress;
  const towerCount = document.querySelector('#watchtower-count');
  if (towerCount) {
    towerCount.textContent = Math.min(towerProgress ?? 0, 3) + '/3';
    document.querySelector('#watchtower-next').textContent = towerProgress === 4 ? 'Reward claimed.'
      : towerProgress === 3 ? 'Claim your reward with /emberwolf quests.'
      : towerProgress == null ? 'Accept the quest with /emberwolf quests.'
      : 'Use /emberwolf hunt and choose Old Watchtower.';
  }
  fenUnlocked = hero.level >= 5;
  fenProgress = hero.cinderfen_progress;
  const fenCount = document.querySelector('#cinderfen-count');
  if (fenCount) {
    fenCount.textContent = Math.min(fenProgress ?? 0, 3) + '/3';
    document.querySelector('#cinderfen-next').textContent = fenProgress === 4 ? 'Reward claimed.'
      : fenProgress === 3 ? 'Claim your reward with /emberwolf quests.'
      : fenProgress == null ? 'Accept the quest with /emberwolf quests.'
      : 'Use /emberwolf hunt and choose Cinderfen.';
  }
  renderQuest(hero.ashwood_progress);
  sheet.hidden = false;
}

const heroViews = [...document.querySelectorAll('[data-hero-view]')];
function showHeroView(view) {
  for (const button of heroViews) {
    const selected = button.dataset.heroView === view;
    button.setAttribute('aria-pressed', String(selected));
    document.getElementById(button.dataset.heroView).hidden = !selected;
  }
}
for (const button of heroViews) button.addEventListener('click', () => showHeroView(button.dataset.heroView));

let renderVersion = 0;
async function refresh(session) {
  const version = ++renderVersion;
  sheet.hidden = true;
  clearEquipment();
  showHeroView('journal-view');
  const journal = document.querySelector('#journal');
  if (journal) {
    journal.hidden = true;
    for (const id of ['quest-state', 'quest-count', 'quest-next', 'quest-command']) document.getElementById(id).textContent = '';
    document.getElementById('quest-progress').value = 0;
  }
  if (questFilter?.matches('fieldset')) questFilter.querySelector('[value="open"]').checked = true;
  else if (questFilter) questFilter.value = 'open';
  for (const id of ['hero-hp', 'hero-mp']) {
    const resource = document.getElementById(id);
    if (resource) resource.textContent = '';
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
  const [{ data, error }, bag] = await Promise.all([
    client.rpc('emberwolf_my_hero').maybeSingle(),
    client.rpc('emberwolf_my_inventory').maybeSingle(),
  ]);
  if (version !== renderVersion) return;
  if (error) status.textContent = 'Could not load your hero. Refresh to try again.';
  else if (!data) status.textContent = 'No hero is linked to this Discord account. Use /emberwolf begin in NoDiceGG.';
  else {
    renderHero(data);
    renderEquipment(data, bag.error ? null : bag.data);
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
