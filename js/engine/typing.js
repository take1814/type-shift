import { CHAR_ORDER, clamp, getCharStats, mastery, typeBonus, unlockedChars } from './chars.js?v=enemy-art-batch-v50';
import { emit } from '../core/bus.js?v=enemy-art-batch-v50';
import { WORDS } from './words.js?v=enemy-art-batch-v50';

const random = (items) => items[Math.floor(Math.random() * items.length)];
export function genLesson(profile, focusChars = null, options = {}) {
  const unlocked = new Set(options.allowedChars || unlockedChars(profile));
  const focus = new Set(focusChars || []);
  const lockedPreview = new Set(options.lockedPreviewChars || []);
  const candidates = WORDS.filter((word) => word.chars.every((char) => unlocked.has(char)));
  const safeCandidates = candidates.length ? candidates : WORDS.filter((word) => [...word.text].every((char) => char === ' ' || unlocked.has(char)));
  const chosen = [];
  const targetWords = Math.max(1, Math.round(options.targetWords || 8));
  while (chosen.length < targetWords) {
    const bag = safeCandidates.flatMap((word) => {
      const focused = [...focus].some((char) => word.chars.includes(char));
      const locked = [...lockedPreview].some((char) => word.chars.includes(char));
      const weakness = word.chars.reduce((sum, char) => sum + Math.max(0, 100 - mastery(profile, char)), 0);
      const weight = Math.max(1, Math.round(1 + weakness / 100 + (focused ? 3 : 0) + (locked ? (options.includeLockedKeys ? 2 : 0) : 0)));
      return Array.from({ length: weight }, () => word.text);
    }).filter((word) => !chosen.slice(-3).includes(word));
    chosen.push(random(bag.length ? bag : safeCandidates.map((word) => word.text)));
  }
  return chosen.join(' ');
}

export class TypingSession {
  constructor(profile, mode, focusChars = null, policy = null) {
    this.profile = profile;
    this.mode = mode;
    this.focusChars = focusChars;
    this.policy = policy || {};
    this.allowedChars = this.policy.allowedChars || unlockedChars(profile);
    this.text = genLesson(profile, focusChars, this.policy);
    this.index = 0;
    this.startedAt = performance.now();
    this.lastStrokeAt = null;
    this.hits = 0;
    this.misses = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.finishedWords = 0;
    this.perfectWords = 0;
    this.longWords = 0;
    this.symbolWords = 0;
    this.currentWordMisses = 0;
    this.wordStartIndex = 0;
  }

  get expected() { return this.text[this.index] ?? ''; }
  get elapsedMs() { return performance.now() - this.startedAt; }
  get accuracy() { const tries = this.hits + this.misses; return tries ? Math.round(100 * this.hits / tries) : 100; }
  get wpm() { return Math.round((this.hits / 5) / Math.max(this.elapsedMs / 60000, 1 / 60000)); }
  get multiplier() { return this.combo < 10 ? 1 : this.combo < 25 ? 1.2 : this.combo < 50 ? 1.5 : 2; }

  applyPolicy(policy = {}) {
    this.policy = policy;
    this.allowedChars = policy.allowedChars || unlockedChars(this.profile);
    this.text = genLesson(this.profile, this.focusChars, policy);
    this.index = 0;
    this.wordStartIndex = 0;
    this.currentWordMisses = 0;
  }

  record(char, hit) {
    if (char === ' ') return;
    const stats = getCharStats(this.profile, char);
    if (hit) {
      stats.hits += 1;
      const now = performance.now();
      const delta = this.lastStrokeAt ? now - this.lastStrokeAt : 0;
      if (delta > 30 && delta < 1500) { stats.totalMs += delta; stats.samples += 1; }
      if (stats.samples > 80) { stats.totalMs = Math.round(stats.totalMs * 0.85); stats.samples = Math.round(stats.samples * 0.85); }
      this.profile.rpg.lifetime.keystrokes += 1;
      this.lastStrokeAt = now;
      emit('key:hit', { char, dt: delta });
    } else {
      stats.misses += 1;
      if (stats.hits + stats.misses > 200) { stats.hits = Math.round(stats.hits * 0.85); stats.misses = Math.round(stats.misses * 0.85); }
      emit('key:miss', { char });
    }
    this.profile.chars[char] = stats;
  }

  input(key) {
    const expected = this.expected;
    if (!expected) return { state: 'complete' };
    if (key !== expected) {
      this.misses += 1;
      this.combo = 0;
      this.currentWordMisses += 1;
      this.record(expected, false);
      return { state: 'miss', expected };
    }
    this.index += 1;
    this.hits += 1;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.record(expected, true);
    this.score += Math.round(10 * this.multiplier * typeBonus(expected));
    const wordEnded = expected !== ' ' && (this.text[this.index] === ' ' || this.index === this.text.length);
    let completedWord = '';
    let wordPerfect = false;
    if (wordEnded) {
      const word = this.text.slice(this.wordStartIndex, this.index);
      completedWord = word;
      wordPerfect = this.currentWordMisses === 0;
      this.finishedWords += 1;
      if (wordPerfect) this.perfectWords += 1;
      if ([...word].filter((char) => /[a-z]/i.test(char)).length >= 7) this.longWords += 1;
      if (/[^a-z ]/i.test(word)) this.symbolWords += 1;
    }
    if (expected === ' ') {
      this.wordStartIndex = this.index;
      this.currentWordMisses = 0;
    }
    if (this.index >= this.text.length) {
      this.text = genLesson(this.profile, this.focusChars, this.policy);
      this.index = 0;
      this.wordStartIndex = 0;
      this.currentWordMisses = 0;
      return { state: 'lesson', expected, wordEnded, word: completedWord, wordLength: completedWord.length, wordPerfect };
    }
    return { state: 'hit', expected, wordEnded, word: completedWord, wordLength: completedWord.length, wordPerfect };
  }

  result() {
    const minutes = Math.max(this.elapsedMs / 60000, 1 / 60000);
    return {
      mode: this.mode,
      wpm: Math.round((this.hits / 5) / minutes),
      acc: this.accuracy,
      score: this.score,
      combo: this.maxCombo,
      miss: this.misses,
      hits: this.hits,
      words: this.finishedWords,
      perfectWords: this.perfectWords,
      longWords: this.longWords,
      symbolWords: this.symbolWords,
      playMs: Math.round(this.elapsedMs),
      gold: Math.round(this.score / 12),
      xp: Math.round(this.score / 10),
    };
  }
}
