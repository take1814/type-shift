const STORAGE_KEY = 'typeshift:v3';

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const finite = (value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
const strings = (value, max = 100) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string').slice(0, max))] : [];
const safeMap = (value) => isRecord(value) ? Object.fromEntries(Object.entries(value).filter(([key]) => !['__proto__', 'constructor', 'prototype'].includes(key)).slice(0, 500)) : {};
const numericMap = (value, max = 100) => Object.fromEntries(Object.entries(safeMap(value)).map(([key, item]) => [key, Math.round(finite(item, 0, 0, max))]));
const booleanMap = (value) => Object.fromEntries(Object.entries(safeMap(value)).map(([key, item]) => [key, Boolean(item)]));

export function createProfile() {
  return {
    version: 5,
    chars: {},
    unlocked: 6,
    history: [],
    created: Date.now(),
    settings: { sfx: true, bgm: false, showKb: true, reducedMotion: false, manualSupport: false },
    rpg: { level: 1, xp: 0, gold: 0, sp: 0, materials: { kotonoha: 0, shard: 0 }, weapons: { owned: ['starter'], equipped: 'starter', plus: {}, evolved: {} }, skills: { tree: [] }, quest: { cleared: {}, unlockedStage: 1 }, campaign: { version: 5, questCleared: {}, kings: [], godCleared: false, startedAt: Date.now() }, companions: { rescued: [], party: [], bond: {}, rescueTrials: {}, legacyCompanions: {}, rosterV2Applied: true, siblingGauge: 0, senrinTrials: { still: false, flow: false, insight: false, failures: 0, attempts: 0, recalibrated: false }, noxRevealed: false, noxProvisional: false, brothersReconciled: false, finalUnlocked: false, migrationApplied: true }, lifetime: { keystrokes: 0, bossKills: 0, playMs: 0 } },
    meta: { achievements: [], titles: { owned: ['nameless'], equipped: 'nameless' }, bond: { level: 1, points: 0, total: 0, lastLoginDay: '' }, codex: { enemies: [], enemyRecords: {}, drops: {}, weapons: ['starter'] }, story: { seen: [], dialoguesSeen: [], flags: { brotherClue1: false, brotherClue2: false, noxIdentityRevealed: false, brothersReconciled: false, finalChapterUnlocked: false, originShiftComplete: false } }, daily: { day: '', missions: [], streak: 0 } },
  };
}

export function normalizeProfile(source) {
  const base = createProfile();
  const input = isRecord(source) ? source : {};
  const rpg = isRecord(input.rpg) ? input.rpg : {};
  const quest = isRecord(rpg.quest) ? rpg.quest : {};
  const campaign = isRecord(rpg.campaign) ? rpg.campaign : {};
  const lifetime = isRecord(rpg.lifetime) ? rpg.lifetime : {};
  const weapons = isRecord(rpg.weapons) ? rpg.weapons : {};
  const companions = isRecord(rpg.companions) ? rpg.companions : {};
  const meta = isRecord(input.meta) ? input.meta : {};
  const titles = isRecord(meta.titles) ? meta.titles : {};
  const bond = isRecord(meta.bond) ? meta.bond : {};
  const codex = isRecord(meta.codex) ? meta.codex : {};
  const story = isRecord(meta.story) ? meta.story : {};
  const daily = isRecord(meta.daily) ? meta.daily : {};
  const settings = isRecord(input.settings) ? input.settings : {};

  const chars = {};
  Object.entries(safeMap(input.chars)).slice(0, 64).forEach(([char, value]) => {
    if (char.length !== 1 || !isRecord(value)) return;
    chars[char] = {
      hits: Math.round(finite(value.hits, 0, 0, 10000000)),
      misses: Math.round(finite(value.misses, 0, 0, 10000000)),
      totalMs: Math.round(finite(value.totalMs, 0, 0, 1000000000)),
      samples: Math.round(finite(value.samples, 0, 0, 10000000)),
    };
  });

  const cleared = {};
  Object.entries(safeMap(quest.cleared)).slice(0, 20).forEach(([id, value]) => {
    if (!/^\d+$/.test(id) || !isRecord(value)) return;
    cleared[id] = { stars: Math.round(finite(value.stars, 1, 1, 3)), clearedAt: finite(value.clearedAt, Date.now(), 0) };
  });

  const campaignQuestCleared = {};
  Object.entries(safeMap(campaign.questCleared)).slice(0, 40).forEach(([id, value]) => {
    if (!/^quest-0[1-6]-0[1-5]$/.test(id) || !isRecord(value)) return;
    campaignQuestCleared[id] = {
      stars: Math.round(finite(value.stars, 1, 1, 3)),
      clearedAt: finite(value.clearedAt, Date.now(), 0),
    };
  });

  const enemyRecords = {};
  Object.entries(safeMap(codex.enemyRecords)).slice(0, 100).forEach(([id, value]) => {
    if (!isRecord(value)) return;
    enemyRecords[id] = { encounters: Math.round(finite(value.encounters, 0, 0, 1000000)), kills: Math.round(finite(value.kills, 0, 0, 1000000)) };
  });
  const enemyRosterMigratedV22 = Boolean(codex.enemyRosterMigratedV22);
  const drops = numericMap(codex.drops, 999999);
  const ownedWeapons = strings(weapons.owned, 32).length ? strings(weapons.owned, 32) : ['starter'];
  const equippedWeapon = typeof weapons.equipped === 'string' && ownedWeapons.includes(weapons.equipped) ? weapons.equipped : ownedWeapons[0];
  if (!enemyRosterMigratedV22) {
    const legacyEnemyMap = {
      glitch: 'runeSlime', ember: 'flameSlime', wisp: 'ghost', shell: 'runeGolem', twins: 'noiseImp',
      noise: 'noiseSlime', wordeater: 'voidScorpion', pyre: 'bloodGolem', mirror: 'glitchMaiden',
      leech: 'bloodLeech', guardian1: 'bossGaius', guardian2: 'bossVolcarion', guardian3: 'bossCelestia',
      guardian4: 'bossAgniros', guardian5: 'bossFrostnova', sovereign: 'bossRaidingald',
      noxshade: 'kingChronos', senrinseal: 'kingNecros', nullking: 'alphaOrigin',
    };
    Object.entries(legacyEnemyMap).forEach(([legacyId, nextId]) => {
      const legacy = enemyRecords[legacyId];
      if (!legacy) return;
      const current = enemyRecords[nextId] || { encounters: 0, kills: 0 };
      enemyRecords[nextId] = {
        encounters: Math.min(1000000, current.encounters + legacy.encounters),
        kills: Math.min(1000000, current.kills + legacy.kills),
      };
      delete enemyRecords[legacyId];
    });
  }

  const missions = Array.isArray(daily.missions) ? daily.missions.slice(0, 10).filter(isRecord).map((mission) => ({
    id: String(mission.id || '').slice(0, 40),
    text: String(mission.text || '').slice(0, 100),
    target: Math.round(finite(mission.target, 1, 1, 100000)),
    progress: Math.round(finite(mission.progress, 0, 0, 100000)),
    reward: Math.round(finite(mission.reward, 0, 0, 100000)),
    claimed: Boolean(mission.claimed),
  })) : [];

  return {
    version: 5,
    chars,
    unlocked: Math.round(finite(input.unlocked, 6, 6, 48)),
    history: Array.isArray(input.history) ? input.history.filter(isRecord).slice(0, 500).map((entry) => ({
      t: finite(entry.t, Date.now(), 0), mode: String(entry.mode || 'TRAINING').slice(0, 20), wpm: Math.round(finite(entry.wpm, 0, 0, 500)), acc: Math.round(finite(entry.acc, 100, 0, 100)), score: Math.round(finite(entry.score, 0, 0, 100000000)), combo: Math.round(finite(entry.combo, 0, 0, 1000000)), miss: Math.round(finite(entry.miss, 0, 0, 1000000)), hits: Math.round(finite(entry.hits, 0, 0, 10000000)), playMs: Math.round(finite(entry.playMs, 0, 0, 86400000)), gold: Math.round(finite(entry.gold, 0, 0, 10000000)), xp: Math.round(finite(entry.xp, 0, 0, 10000000)),
    })) : [],
    created: finite(input.created, Date.now(), 0),
    settings: {
      sfx: typeof settings.sfx === 'boolean' ? settings.sfx : base.settings.sfx,
      bgm: typeof settings.bgm === 'boolean' ? settings.bgm : base.settings.bgm,
      showKb: typeof settings.showKb === 'boolean' ? settings.showKb : base.settings.showKb,
      reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : base.settings.reducedMotion,
      manualSupport: typeof settings.manualSupport === 'boolean' ? settings.manualSupport : base.settings.manualSupport,
    },
    rpg: {
      level: Math.round(finite(rpg.level, 1, 1, 99)), xp: Math.round(finite(rpg.xp, 0, 0, 100000000)), gold: Math.round(finite(rpg.gold, 0, 0, 100000000)), sp: Math.round(finite(rpg.sp, 0, 0, 9999)),
      materials: { kotonoha: Math.round(finite(rpg.materials?.kotonoha, 0, 0, 999999)), shard: Math.round(finite(rpg.materials?.shard, 0, 0, 999999)) },
      weapons: { owned: ownedWeapons, equipped: equippedWeapon, plus: numericMap(weapons.plus, 15), evolved: booleanMap(weapons.evolved) },
      skills: { tree: strings(rpg.skills?.tree, 100) },
      quest: { cleared, unlockedStage: Math.round(finite(quest.unlockedStage, 1, 1, 6)) },
      campaign: {
        version: 5,
        questCleared: campaignQuestCleared,
        kings: strings(campaign.kings, 3).filter((id) => /^king-0[1-3]$/.test(id)),
        godCleared: Boolean(campaign.godCleared),
        startedAt: finite(campaign.startedAt, Date.now(), 0),
      },
      companions: {
        rescued: strings(companions.rescued, 10),
        party: strings(companions.party, 2),
        bond: Object.fromEntries(Object.entries(safeMap(companions.bond)).slice(0, 10).map(([id, value]) => [id, {
          rank: Math.round(finite(value?.rank, 0, 0, 5)),
          points: Math.round(finite(value?.points, 0, 0, 100000)),
          seen: strings(value?.seen, 10),
        }])),
        rescueTrials: Object.fromEntries(Object.entries(safeMap(companions.rescueTrials)).slice(0, 10).map(([id, value]) => [id, {
          attempts: Math.round(finite(value?.attempts, 0, 0, 9999)),
          cleared: Boolean(value?.cleared),
          lastReason: typeof value?.lastReason === 'string' ? value.lastReason.slice(0, 180) : '',
        }])),
        legacyCompanions: Object.fromEntries(Object.entries(safeMap(companions.legacyCompanions)).slice(0, 10).map(([id, value]) => [id, {
          rescued: Boolean(value?.rescued),
          inParty: Boolean(value?.inParty),
          bond: isRecord(value?.bond) ? {
            rank: Math.round(finite(value.bond.rank, 0, 0, 5)),
            points: Math.round(finite(value.bond.points, 0, 0, 100000)),
            seen: strings(value.bond.seen, 10),
          } : null,
          rescueTrial: isRecord(value?.rescueTrial) ? {
            attempts: Math.round(finite(value.rescueTrial.attempts, 0, 0, 9999)),
            cleared: Boolean(value.rescueTrial.cleared),
            lastReason: typeof value.rescueTrial.lastReason === 'string' ? value.rescueTrial.lastReason.slice(0, 180) : '',
          } : null,
          archivedAt: finite(value?.archivedAt, Date.now(), 0),
        }])),
        rosterV2Applied: Boolean(companions.rosterV2Applied),
        siblingGauge: Math.round(finite(companions.siblingGauge, 0, 0, 100)),
        senrinTrials: {
          still: Boolean(companions.senrinTrials?.still),
          flow: Boolean(companions.senrinTrials?.flow),
          insight: Boolean(companions.senrinTrials?.insight),
          failures: Math.round(finite(companions.senrinTrials?.failures, 0, 0, 999)),
          attempts: Math.round(finite(companions.senrinTrials?.attempts, 0, 0, 9999)),
          recalibrated: Boolean(companions.senrinTrials?.recalibrated),
        },
        noxRevealed: Boolean(companions.noxRevealed),
        noxProvisional: Boolean(companions.noxProvisional),
        brothersReconciled: Boolean(companions.brothersReconciled),
        finalUnlocked: Boolean(companions.finalUnlocked),
        migrationApplied: [4, 5].includes(input.version) ? Boolean(companions.migrationApplied ?? true) : false,
      },
      lifetime: { keystrokes: Math.round(finite(lifetime.keystrokes, 0, 0, 1000000000)), bossKills: Math.round(finite(lifetime.bossKills, 0, 0, 10000000)), playMs: Math.round(finite(lifetime.playMs, 0, 0, 100000000000)) },
    },
    meta: {
      achievements: strings(meta.achievements, 100),
      titles: { owned: strings(titles.owned, 100).length ? strings(titles.owned, 100) : ['nameless'], equipped: typeof titles.equipped === 'string' ? titles.equipped : 'nameless' },
      bond: { level: Math.round(finite(bond.level, 1, 1, 10)), points: Math.round(finite(bond.points, 0, 0, 100000)), total: Math.round(finite(bond.total, 0, 0, 100000000)), lastLoginDay: typeof bond.lastLoginDay === 'string' ? bond.lastLoginDay.slice(0, 10) : '' },
      codex: { enemies: strings(codex.enemies, 100), enemyRecords, drops, enemyRosterMigratedV22: true, weapons: strings(codex.weapons, 100).length ? strings(codex.weapons, 100) : ['starter'] },
      story: { seen: strings(story.seen, 100), dialoguesSeen: strings(story.dialoguesSeen, 100), flags: {
        brotherClue1: Boolean(story.flags?.brotherClue1), brotherClue2: Boolean(story.flags?.brotherClue2), noxIdentityRevealed: Boolean(story.flags?.noxIdentityRevealed), brothersReconciled: Boolean(story.flags?.brothersReconciled), finalChapterUnlocked: Boolean(story.flags?.finalChapterUnlocked), originShiftComplete: Boolean(story.flags?.originShiftComplete),
      } },
      daily: { day: typeof daily.day === 'string' ? daily.day.slice(0, 10) : '', missions, streak: Math.round(finite(daily.streak, 0, 0, 10000)) },
    },
  };
}

export function validateProfile(source) {
  const errors = [];
  if (!isRecord(source)) errors.push('JSONのルートがオブジェクトではありません。');
  if (![3, 4, 5].includes(source?.version)) errors.push('対応していないセーブバージョンです。');
  if (!isRecord(source?.chars)) errors.push('文字習熟データがありません。');
  if (!isRecord(source?.rpg)) errors.push('RPG進行データがありません。');
  if (!isRecord(source?.meta)) errors.push('実績・図鑑データがありません。');
  if (!isRecord(source?.settings)) errors.push('設定データがありません。');
  if (source?.history !== undefined && !Array.isArray(source.history)) errors.push('プレイ履歴の形式が不正です。');
  return { valid: errors.length === 0, errors, profile: errors.length ? null : normalizeProfile(source) };
}

export function loadProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if ([3, 4, 5].includes(stored?.version)) return normalizeProfile(stored);
  } catch (_) { /* 壊れた保存データは初期状態へ戻す。 */ }
  return createProfile();
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProfile(profile)));
}
