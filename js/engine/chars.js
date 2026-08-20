export const LETTERS = 'etaoinsrhldcumfpgwybvkxjqz'.split('');
export const DIGITS = '1802973465'.split('');
export const SYMBOLS = [',', '.', '-', '/', ';', "'", '!', '?', '(', ')', ':', '"'];
export const CHAR_ORDER = [...LETTERS, ...DIGITS, ...SYMBOLS];
export const START_KEYS = 6;
export const UNLOCK_SCORE = 65;
export const MIN_SAMPLES = 15;
export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

export const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

export const SHIFT_BASE = { '!': '1', '?': '/', '(': '9', ')': '0', ':': ';', '"': "'" };
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function getCharStats(profile, char) {
  return profile.chars[char] ?? { hits: 0, misses: 0, totalMs: 0, samples: 0 };
}

export function mastery(profile, char) {
  const { hits, misses, totalMs, samples } = getCharStats(profile, char);
  const tries = hits + misses;
  if (!tries) return 0;
  const accNorm = clamp((hits / tries - 0.8) / 0.2, 0, 1);
  const avgMs = samples ? totalMs / samples : 900;
  const spdNorm = clamp((700 - avgMs) / 500, 0, 1);
  const confidence = clamp(tries / MIN_SAMPLES, 0, 1);
  return Math.round(100 * confidence * (0.45 * accNorm + 0.55 * spdNorm));
}

export function unlockedChars(profile) {
  return CHAR_ORDER.slice(0, clamp(profile.unlocked || START_KEYS, START_KEYS, CHAR_ORDER.length));
}

export function weakestChars(profile, count = 3) {
  return unlockedChars(profile).sort((a, b) => mastery(profile, a) - mastery(profile, b)).slice(0, count);
}

export function typeBonus(char) {
  if (DIGITS.includes(char)) return 1.15;
  if (SYMBOLS.includes(char)) return 1.3;
  return 1;
}

export function checkUnlock(profile) {
  const active = unlockedChars(profile);
  const allReady = active.every((char) => {
    const stats = getCharStats(profile, char);
    return stats.hits + stats.misses >= MIN_SAMPLES && mastery(profile, char) >= UNLOCK_SCORE;
  });
  if (!allReady || profile.unlocked >= CHAR_ORDER.length) return null;
  profile.unlocked += 1;
  if (profile.unlocked === 27) return '数字の試練が解放されました。';
  if (profile.unlocked === 37) return '記号の試練が解放されました。';
  return `新しいキー「${CHAR_ORDER[profile.unlocked - 1].toUpperCase()}」が解放されました。`;
}
