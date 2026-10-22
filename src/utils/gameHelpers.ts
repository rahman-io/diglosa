import { WORDS, CATEGORIES } from '../data/vocab';
import { AREA_DEF } from '../data/gameData';
import { WordProgress } from '../types/game';

export const LV = [
  'Telur Pemula',
  'Anak Burung',
  'Burung Kecil',
  'Terbang Rendah',
  'Penjelajah Kata',
  'Hoot Cerdik',
  'Kakak Hoot',
  'Master A1',
];

export function getLevel(xp: number) {
  const n = Math.min(LV.length - 1, Math.floor(xp / 150));
  const max = n >= LV.length - 1;
  return {
    n: n + 1,
    title: LV[n],
    max,
    pct: max ? 100 : Math.floor(((xp - n * 150) / 150) * 100),
    left: (n + 1) * 150 - xp,
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getAreaCategoryIndices(areaIndex: number): number[] {
  const area = AREA_DEF[areaIndex];
  if (!area) return [];
  return area.cats
    .map((name: string) => CATEGORIES.findIndex((c) => c.idName === name))
    .filter((idx: number) => idx !== -1);
}

export function getAreaWordIndices(areaIndex: number): number[] {
  const catIndices = getAreaCategoryIndices(areaIndex);
  const result: number[] = [];
  WORDS.forEach((w, idx) => {
    if (catIndices.includes(w.cat)) {
      result.push(idx);
    }
  });
  return result;
}

export function getAreaStats(areaIndex: number, progress: Record<number, WordProgress>) {
  const indices = getAreaWordIndices(areaIndex);
  let seen = 0;
  let mastered = 0;
  for (const idx of indices) {
    const p = progress[idx];
    if (p && p.r + p.w > 0) seen++;
    if (p && p.r >= 3 && p.r > p.w) mastered++;
  }
  return {
    total: indices.length,
    seen,
    mastered,
    pctSeen: indices.length ? Math.round((seen / indices.length) * 100) : 0,
    pctMastered: indices.length ? Math.round((mastered / indices.length) * 100) : 0,
  };
}

export function generateQuizQuestion(targetWordIndex: number, areaIndices: number[]) {
  const target = WORDS[targetWordIndex];
  const pool = areaIndices.filter((idx) => idx !== targetWordIndex);
  const shuffledPool = shuffle(pool);
  const distractors = shuffledPool.slice(0, 3).map((idx) => WORDS[idx].id);
  
  const options = shuffle([target.id, ...distractors]);
  const answerIndex = options.indexOf(target.id);

  return {
    wordIndex: targetWordIndex,
    en: target.en,
    id: target.id,
    options,
    answerIndex,
  };
}

export function generateMatchGame(areaIndices: number[], count = 8) {
  const chosenIndices = shuffle(areaIndices).slice(0, count);
  const cards: Array<{ id: string; wordIndex: number; text: string; lang: 'en' | 'id'; matched: boolean }> = [];

  chosenIndices.forEach((idx) => {
    const word = WORDS[idx];
    cards.push({
      id: `en-${idx}`,
      wordIndex: idx,
      text: word.en,
      lang: 'en',
      matched: false,
    });
    cards.push({
      id: `id-${idx}`,
      wordIndex: idx,
      text: word.id,
      lang: 'id',
      matched: false,
    });
  });

  return shuffle(cards);
}
