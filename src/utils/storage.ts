import { GameState } from '../types/game';

const SAVE_KEY = 'hoot-a1-v1';
const IELTS_KEY = 'hoot-ielts-a1-v1';

export function getDefaultGameState(): GameState {
  return {
    p: {},
    xp: 0,
    streak: 0,
    last: '',
    day: { d: '', n: 0 },
    sound: true,
    topic: -1,
    map: 'hutan',
    ctrl: 'joystick',
    autofs: true,
    hp: 5,
    maxhp: 5,
    gems: 0,
    gemTotal: 0,
    kills: 0,
    diff: 'petualang',
    won: {},
    adv: { done: {}, portal: 0, msgDay: '', castle: 0 },
    storyLock: true,
    qtimer: 'on',
    fx: 'full',
    gun: {
      cur: 'ketapel',
      owned: false,
      ammo: { ketapel: 0 },
    },
    story: {
      crown: {},
      items: {},
      ribbons: {},
    },
    rpg: {
      intro: false,
      won: {},
      in: {},
      defeat: null,
    },
    drops: {},
    shot: {},
    deal: {},
    vil: { d: {}, boss: 0 },
    mkt: { d: {}, boss: 0 },
    sat: { d: {}, boss: 0 },
    kot: { d: {}, boss: 0 },
    wkt: { d: {}, boss: 0 },
    cave: { d: {}, boss: 0 },
  };
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaultGameState();
      return {
        ...defaults,
        ...parsed,
        adv: { ...defaults.adv, ...(parsed.adv || {}) },
        gun: { ...defaults.gun, ...(parsed.gun || {}) },
        story: { ...defaults.story, ...(parsed.story || {}) },
        rpg: { ...defaults.rpg, ...(parsed.rpg || {}) },
      };
    }
  } catch (e) {
    console.error('Failed to load save', e);
  }
  return getDefaultGameState();
}

export function saveGameState(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function loadIeltsScores(): Record<string, any> {
  try {
    const raw = localStorage.getItem(IELTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

export function saveIeltsScores(scores: Record<string, any>) {
  try {
    localStorage.setItem(IELTS_KEY, JSON.stringify(scores));
  } catch (e) {}
}

export function resetAllProgress(): GameState {
  const fresh = getDefaultGameState();
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(IELTS_KEY);
  } catch (e) {}
  saveGameState(fresh);
  return fresh;
}
