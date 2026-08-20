import { CHAR_ORDER, clamp, START_KEYS } from '../engine/chars.js?v=difficulty-v51';

// v5.1 難易度基盤。敵のHPを増やすだけでなく、出題語列とキー範囲も同じプロフィールで管理する。
export const PROMPT_MULTIPLIERS = Object.freeze({
  mob: 1.5,
  elite: 1.75,
  mid: 2,
  boss: 2,
  king: 3,
  god: 4,
});

// ステージ開始時に最低限使用可能にするキー数。実績・習熟による解放数を下回らない。
export const STAGE_KEY_FLOORS = Object.freeze({ 1: 6, 2: 9, 3: 12, 4: 16, 5: 20, 6: 24 });

export function battleKind(campaignNode = null) {
  if (campaignNode?.kind === 'god') return 'god';
  if (campaignNode?.kind === 'king') return 'king';
  return 'quest';
}

export function promptMultiplier(tier = 'mob', kind = 'quest') {
  if (kind === 'king') return PROMPT_MULTIPLIERS.king;
  if (kind === 'god') return PROMPT_MULTIPLIERS.god;
  return PROMPT_MULTIPLIERS[tier] || PROMPT_MULTIPLIERS.mob;
}

export function stageKeyFloor(stageId = 1) {
  return STAGE_KEY_FLOORS[Number(stageId)] || STAGE_KEY_FLOORS[1];
}

export function syncStageKeyUnlock(profile, stageId = 1) {
  const current = clamp(Number(profile.unlocked) || START_KEYS, START_KEYS, CHAR_ORDER.length);
  const next = clamp(Math.max(current, stageKeyFloor(stageId)), START_KEYS, CHAR_ORDER.length);
  if (next > current) profile.unlocked = next;
  return next;
}

export function buildTypingPolicy(profile, { stageId = 1, tier = 'mob', kind = 'quest' } = {}) {
  const baseCount = syncStageKeyUnlock(profile, stageId);
  const floor = stageKeyFloor(stageId);
  const normalCount = clamp(Math.max(baseCount, floor), START_KEYS, CHAR_ORDER.length);
  const lockedPreviewCount = kind === 'king' ? 4 : 0;
  const previewEnd = clamp(normalCount + lockedPreviewCount, normalCount, CHAR_ORDER.length);
  const allowedChars = CHAR_ORDER.slice(0, previewEnd);
  return {
    stageId: Number(stageId),
    tier,
    kind,
    promptMultiplier: promptMultiplier(tier, kind),
    targetWords: Math.max(8, Math.ceil(8 * promptMultiplier(tier, kind))),
    unlockedChars: CHAR_ORDER.slice(0, normalCount),
    allowedChars,
    lockedPreviewChars: CHAR_ORDER.slice(normalCount, previewEnd),
    includeLockedKeys: kind === 'king',
  };
}

