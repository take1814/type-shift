import { emit } from '../core/bus.js?v=enemy-art-batch-v50';
import { typeBonus, weakestChars } from '../engine/chars.js?v=enemy-art-batch-v50';
import { COMPANIONS, activeCompanions, ensureCompanions } from './companions.js?v=enemy-art-batch-v50';
import { ENEMIES, rollEnemyDrop } from './enemy-catalog.js?v=enemy-art-batch-v50';
import { combatStats } from './progression.js?v=enemy-art-batch-v50';
import { battleKind, buildTypingPolicy, promptMultiplier, syncStageKeyUnlock } from './difficulty.js?v=difficulty-v51';

const TIER_BASE = {
  mob: { hp: 70, atk: 9, interval: 6 },
  elite: { hp: 125, atk: 12, interval: 5.4 },
  mid: { hp: 190, atk: 16, interval: 4.9 },
  boss: { hp: 390, atk: 23, interval: 4.1 },
};

export const BATTLE_BALANCE = {
  enemyHpFactor: 4.25,
  stageHpGrowth: .24,
  stageAttackGrowth: .1,
  minimumDamageRate: .25,
};

export const STAGES = [
  {
    id: 1, name: '崩壊した魔都', element: 'machine', recommended: 1, bossId: 'bossGaius',
    waves: ['mob', 'elite', 'mid', 'boss'],
    pool: {
      mob: ['runeSlime', 'runeCrystal', 'glitchSpider', 'runeGolem', 'skeletonSoldier', 'machineDrone', 'rustedSpearman', 'glitchSpark', 'stoneTroll', 'glitchGolem', 'spikeBall'],
      elite: ['armoredTroll', 'darkMage', 'glitchMimic', 'runeHunter', 'runeGuardian', 'noiseFallen'],
      mid: ['cyclops', 'deathKnight', 'runeElemental', 'glitchMaiden'],
      boss: ['bossGaius'],
    },
  },
  {
    id: 2, name: '侵食された魔森', element: 'shadow', recommended: 5, bossId: 'bossVolcarion',
    waves: ['mob', 'elite', 'mid', 'boss'],
    pool: {
      mob: ['shadowBat', 'noiseImp', 'voidScorpion', 'shadowWolf', 'darkSlime', 'goblinWarrior', 'goblinArcher', 'woodSlime', 'blindBat', 'darkWolf', 'shadowImp', 'shadowSlime', 'voidSlime', 'darkImp'],
      elite: ['voidKnight', 'corruptGuardian', 'hellStalker', 'voidDrake', 'voidHound', 'cultist', 'cursedSwordsman'],
      mid: ['abyssSpirit', 'voidReaper', 'youngDarkDragon', 'shadowChimera', 'cursePriest'],
      boss: ['bossVolcarion'],
    },
  },
  {
    id: 3, name: '聖樹の大地', element: 'nature', recommended: 9, bossId: 'bossCelestia',
    waves: ['mob', 'elite', 'mid', 'boss'],
    pool: {
      mob: ['goblinWarrior', 'goblinArcher', 'goblinShaman', 'runeCrystal', 'woodSlime', 'windImp', 'earthImp', 'lightImp', 'ghost', 'lightSlime', 'poisonSlime'],
      elite: ['runeHunter', 'indexBlade', 'corruptGuardian', 'runeGuardian', 'sandWorm'],
      mid: ['runeElemental', 'cursePriest', 'glitchMaiden', 'abyssSpirit'],
      boss: ['bossCelestia'],
    },
  },
  {
    id: 4, name: '灼熱の火山国', element: 'flame', recommended: 13, bossId: 'bossAgniros',
    waves: ['mob', 'elite', 'mid', 'boss'],
    pool: {
      mob: ['flameSlime', 'fireImp', 'noiseImp', 'bloodLeech', 'goblinBombardier', 'troll', 'earthSlime', 'earthImp'],
      elite: ['bloodOgre', 'armoredTroll', 'hellStalker', 'berserker', 'sandWorm'],
      mid: ['bloodGolem', 'cyclops', 'deathKnight', 'youngDarkDragon'],
      boss: ['bossAgniros'],
    },
  },
  {
    id: 5, name: '凍結の氷海', element: 'ice', recommended: 17, bossId: 'bossFrostnova',
    waves: ['mob', 'elite', 'mid', 'boss'],
    pool: {
      mob: ['iceSlime', 'stormSlime', 'ghost', 'iceImp', 'metalSlime', 'crystalWorm', 'skeletonMage', 'darkFairy', 'skeletonArcher'],
      elite: ['voidKnight', 'indexBlade', 'crystalWorm', 'cursedKnight', 'runeGuardian', 'sisterWorm'],
      mid: ['abyssSpirit', 'runeElemental', 'deathKnight', 'cursePriest'],
      boss: ['bossFrostnova'],
    },
  },
  {
    id: 6, name: '浮遊する天空城', element: 'thunder', recommended: 21, bossId: 'bossRaidingald',
    waves: ['mob', 'elite', 'mid', 'boss'],
    pool: {
      mob: ['plasmaSlime', 'thunderImp', 'machineDrone', 'lightImp', 'glitchSpark', 'runeMage', 'noiseSlime', 'stormSlime'],
      elite: ['darkMage', 'runeHunter', 'glitchMimic', 'indexBlade', 'shadowAssassin'],
      mid: ['runeElemental', 'deathKnight', 'glitchMaiden', 'voidReaper'],
      boss: ['bossRaidingald'],
    },
  },
];

// 敵台帳のステージ参照を、実際の出現プールから一元的に補完する。
// 複数ステージへ登場する敵は stageIds に全履歴を保持し、
// stageId には代表ステージを入れて仕様書の単一参照にも対応する。
const enemyStageIds = new Map();
STAGES.forEach((stage) => {
  Object.values(stage.pool).flat().forEach((id) => {
    if (!enemyStageIds.has(id)) enemyStageIds.set(id, []);
    const list = enemyStageIds.get(id);
    if (!list.includes(stage.id)) list.push(stage.id);
  });
});
// ステージプールに直接出ない王・神は、キャンペーン上の最終到達ステージを参照先にする。
[['kingChronos', 2], ['kingAerpocalion', 4], ['kingNecros', 6], ['alphaOrigin', 6]].forEach(([id, stageId]) => {
  enemyStageIds.set(id, [stageId]);
});
Object.values(ENEMIES).forEach((item) => {
  const stageIds = enemyStageIds.get(item.id) || [];
  item.stageIds = stageIds;
  item.stageId = stageIds[0] ? `stage-${String(stageIds[0]).padStart(2, '0')}` : null;
  if (item.presentation) item.presentation.lightingProfile = item.stageId ? `${item.stageId}-enemy` : 'stage-shared';
});

export { ENEMIES };

const QUEST_WAVES = {
  1: ['mob', 'mob', 'elite'],
  2: ['mob', 'mob', 'elite'],
  3: ['mob', 'elite', 'mid'],
  4: ['elite', 'mid', 'mid'],
  5: ['mob', 'elite', 'mid', 'boss'],
};

const CAMPAIGN_BOSSES = {
  'king-01': 'kingChronos',
  'king-02': 'kingAerpocalion',
  'king-03': 'kingNecros',
  'god-01': 'alphaOrigin',
};

const pick = (items) => items[Math.floor(Math.random() * items.length)];

function ensureEnemyRecords(profile) {
  profile.meta ??= {};
  profile.meta.codex ??= {};
  profile.meta.codex.enemyRecords ??= {};
  return profile.meta.codex.enemyRecords;
}

function ensureDropRecords(profile) {
  profile.meta ??= {};
  profile.meta.codex ??= {};
  profile.meta.codex.drops ??= {};
  return profile.meta.codex.drops;
}

export class Battle {
  constructor(profile, stageId = 1, campaignNode = null) {
    this.profile = profile;
    const selectedStage = STAGES.find((stage) => stage.id === stageId) ?? STAGES[0];
    syncStageKeyUnlock(profile, selectedStage.id);
    const campaignBoss = CAMPAIGN_BOSSES[campaignNode?.id] || null;
    this.isGodBattle = campaignNode?.kind === 'god';
    const waves = this.isGodBattle
      ? ['boss', 'boss', 'boss', 'boss']
      : campaignBoss
      ? ['elite', 'mid', 'boss']
      : campaignNode?.kind === 'quest'
        ? (QUEST_WAVES[campaignNode.questIndex] || selectedStage.waves)
        : selectedStage.waves;
    this.stage = { ...selectedStage, waves };
    this.campaignNode = campaignNode;
    this.forcedBossId = campaignBoss || (campaignNode?.questIndex === 5 ? selectedStage.bossId : null);
    this.waveIndex = 0;
    this.stats = combatStats(profile);
    this.companionData = ensureCompanions(profile);
    this.companions = activeCompanions(profile);
    this.supportState = { words: 0, fiona: 0, glen: 0, nox: 0, noxPerfect: 0, veilCombo: 0 };
    this.manualSupport = Boolean(profile.settings?.manualSupport);
    this.manualReady = [];
    this.precisionGuards = 0;
    this.weakHits = 0;
    this.burstUses = 0;
    this.burstFinishers = 0;
    this.ligatureReady = false;
    this.ligatureActive = false;
    this.playerMaxHp = this.stats.maxHp;
    this.playerHp = this.playerMaxHp;
    this.burst = this.stats.effects.startBurst;
    this.attackGauge = 0;
    this.chainPending = false;
    this.rewards = { gold: 0, xp: 0, kotonoha: 0, shard: 0, drops: [] };
    this.enemy = this.spawn();
  }

  typingPolicy() {
    return buildTypingPolicy(this.profile, {
      stageId: this.stage.id,
      tier: this.enemy?.tier || 'mob',
      kind: battleKind(this.campaignNode),
    });
  }

  spawn(forcedId = null, chainCopy = false) {
    const tier = this.stage.waves[this.waveIndex];
    const scriptedId = tier === 'boss' ? this.forcedBossId : null;
    const id = forcedId || scriptedId || pick(this.stage.pool[tier]);
    const base = ENEMIES[id];
    const tierBase = TIER_BASE[base.tier];
    const godPhase = this.isGodBattle ? this.waveIndex + 1 : 0;
    const godHpMultiplier = this.isGodBattle ? [.62, .76, .92, 1.12][godPhase - 1] : 1;
    const godAttackMultiplier = this.isGodBattle ? [.82, .94, 1.08, 1.2][godPhase - 1] : 1;
    const hpGrowth = 1 + (this.stage.id - 1) * BATTLE_BALANCE.stageHpGrowth;
    const attackGrowth = 1 + (this.stage.id - 1) * BATTLE_BALANCE.stageAttackGrowth;
    const currentBattleKind = battleKind(this.campaignNode);
    const promptHpMultiplier = Math.min(3, promptMultiplier(base.tier, currentBattleKind));
    // 1語で撃破されないよう、仕様上の基礎値へ戦闘テンポ調整係数を掛ける。
    const maxHp = Math.round(tierBase.hp * base.hpMult * hpGrowth * BATTLE_BALANCE.enemyHpFactor * promptHpMultiplier * godHpMultiplier);
    const attack = Math.max(1, Math.round(tierBase.atk * base.atkMult * attackGrowth * godAttackMultiplier));
    const records = ensureEnemyRecords(this.profile);
    records[id] ??= { encounters: 0, kills: 0 };
    records[id].encounters += 1;
    this.attackGauge = 0;
    const godPhaseData = this.isGodBattle ? [
      { phaseName: '創造', element: 'light', trait: 'shield', traitText: '創造：文字属性を循環させる起源結界' },
      { phaseName: '書換', element: 'machine', trait: 'mirror', traitText: '書換：入力の意味と属性を反転' },
      { phaseName: '因果', element: 'shadow', trait: 'disrupt', traitText: '因果：過去の苦手文字を攻撃へ変換' },
      { phaseName: '起源', element: 'void', trait: 'sovereign', traitText: '起源：六人の文字力でのみ破壊可能' },
    ][godPhase - 1] : null;
    if (godPhase === 4) this.companions = [...COMPANIONS];
    return {
      ...base,
      id,
      name: godPhaseData ? `${base.name}・${godPhaseData.phaseName}` : base.name,
      element: godPhaseData?.element || base.element,
      trait: godPhaseData?.trait || base.trait,
      traitText: godPhaseData?.traitText || base.traitText,
      godPhase,
      phaseName: godPhaseData?.phaseName || '',
      maxHp,
      hp: maxHp,
      attack,
      attackInterval: tierBase.interval * base.intervalMult,
      difficultyProfile: {
        kind: currentBattleKind,
        promptMultiplier: promptHpMultiplier,
        includeLockedKeys: currentBattleKind === 'king',
      },
      chainCopy,
      shieldBroken: !['shield', 'sovereign'].includes(godPhaseData?.trait || base.trait),
    };
  }

  get weakChar() {
    return this.enemy.tier === 'mob' ? null : (weakestChars(this.profile, 1)[0] || null);
  }

  get elementState() {
    const player = this.stats.weapon.element;
    const enemy = this.enemy.element;
    const advantage = { light: 'shadow', shadow: 'flame', flame: 'light' };
    if (player === 'none' || player === enemy) return { multiplier: 1, label: '等倍' };
    if (advantage[player] === enemy) return { multiplier: 1.3, label: '有利' };
    if (advantage[enemy] === player) return { multiplier: .75, label: '不利' };
    return { multiplier: 1, label: '等倍' };
  }

  hit(combo, critical = false, wordEnded = false, char = '', context = {}) {
    const atk = this.stats.atk;
    const effectiveCritical = this.enemy.trait === 'mirror' ? false : critical;
    const comboMultiplier = combo >= 50 ? 2 + this.stats.effects.combo : combo >= 25 ? 1.5 + this.stats.effects.combo : combo >= 10 ? 1.2 + this.stats.effects.combo : 1;
    const weakMultiplier = this.weakChar && char === this.weakChar ? 1.5 + this.stats.effects.weak : 1;
    const shieldMultiplier = this.enemy.shieldBroken ? 1 : .3;
    if (weakMultiplier > 1) this.weakHits += 1;
    const ligatureStarting = this.hasCompanion('nox') && this.companionData.brothersReconciled && this.ligatureReady && !this.ligatureActive;
    if (ligatureStarting) {
      this.ligatureReady = false;
      this.ligatureActive = true;
      this.companionData.siblingGauge = 0;
    }
    const base = atk * comboMultiplier * this.stats.weapon.mult * typeBonus(char) * this.elementState.multiplier * weakMultiplier * (effectiveCritical ? 2 : 1) * shieldMultiplier * (.85 + Math.random() * .3);
    const finisher = wordEnded ? atk * 2.2 * this.stats.weapon.mult * (1 + this.stats.effects.finisher) * shieldMultiplier : 0;
    let damage = Math.max(1, Math.round(base + finisher));
    const supports = this.applyCompanionSupport({ combo, critical: effectiveCritical, wordEnded, char, damage, context });
    if (this.ligatureActive) {
      const linkDamage = Math.max(1, Math.round(damage * (wordEnded ? .9 : .12)));
      supports.unshift({ id: 'nox', name: wordEnded ? 'ASTER LIGATURE' : 'ASTER LINK', damage: linkDamage, ligature: true });
      if (wordEnded) this.ligatureActive = false;
    }
    if (wordEnded && this.attackGauge >= 65) {
      this.attackGauge = Math.max(0, this.attackGauge - 35);
      this.precisionGuards += 1;
      supports.push({ id: 'guard', name: '精密防御', delay: 35 });
    }
    damage += supports.reduce((sum, item) => sum + (item.damage || 0), 0);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    if (wordEnded) this.enemy.shieldBroken = true;
    const burstGain = 2 + (wordEnded ? 6 : 0);
    this.burst = Math.min(100, this.burst + Math.round(burstGain * (1 + this.stats.effects.burst)));
    if (wordEnded && this.stats.effects.heal) this.playerHp = Math.min(this.playerMaxHp, this.playerHp + this.stats.effects.heal);
    emit('battle:damage', { damage, critical: effectiveCritical, wordEnded, weak: weakMultiplier > 1 });
    if (!this.enemy.hp) return { damage, critical: effectiveCritical, supports, ...this.defeatResult() };
    return { damage, critical: effectiveCritical, supports, enemyDefeated: false };
  }

  hasCompanion(id) {
    return this.companions.some((item) => item.id === id);
  }

  prepareSupport(supports, item) {
    if (this.manualSupport) {
      if (!this.manualReady.some((ready) => ready.id === item.id)) this.manualReady.push(item);
      return;
    }
    this.applySupportSideEffects(item);
    supports.push(item);
  }

  applySupportSideEffects(item) {
    if (item.heal) {
      const healed = Math.min(item.heal, this.playerMaxHp - this.playerHp);
      this.playerHp += healed;
      item.heal = healed;
    }
    if (item.cost) {
      const cost = Math.min(item.cost, this.playerHp - 1);
      this.playerHp -= cost;
      item.cost = cost;
    }
    if (item.burst) this.burst = Math.min(100, this.burst + item.burst);
    if (item.delay) this.attackGauge = Math.max(0, this.attackGauge - item.delay);
  }

  supportSlots() {
    return this.companions.map((companion, index) => ({
      ...companion,
      index,
      ready: this.manualReady.some((item) => item.id === companion.id),
    }));
  }

  activateSupport(index) {
    if (!this.manualSupport || index < 0 || index >= this.companions.length) return null;
    const companion = this.companions[index];
    const readyIndex = this.manualReady.findIndex((item) => item.id === companion.id);
    if (readyIndex < 0) return null;
    const [support] = this.manualReady.splice(readyIndex, 1);
    this.applySupportSideEffects(support);
    if (support.damage) {
      const applied = Math.min(support.damage, Math.max(0, this.enemy.hp - 1));
      this.enemy.hp -= applied;
      support.damage = applied;
    }
    return support;
  }

  applyCompanionSupport({ combo, critical, wordEnded, char, damage, context = {} }) {
    const supports = [];
    if (wordEnded) this.supportState.words += 1;
    if (this.hasCompanion('fiona') && wordEnded && this.supportState.words - this.supportState.fiona >= 2) {
      this.supportState.fiona = this.supportState.words;
      this.prepareSupport(supports, { id: 'fiona', name: 'シャドウトラップ', damage: Math.max(1, Math.round(damage * .16)) });
    }
    if (this.hasCompanion('lilia') && wordEnded && (context.wordLength || 0) >= 7) {
      const magicDamage = Math.max(1, Math.round(damage * .24));
      this.prepareSupport(supports, { id: 'lilia', name: 'ルーンストーム', damage: magicDamage, burst: 4 });
    }
    if (this.hasCompanion('celeste') && wordEnded && combo >= 10 && this.supportState.words % 3 === 0) {
      const heal = Math.min(18, this.playerMaxHp - this.playerHp);
      if (heal > 0) this.prepareSupport(supports, { id: 'celeste', name: 'ホーリーライト', heal: 18 });
    }
    if (this.hasCompanion('veil') && wordEnded && combo >= 20 && combo - this.supportState.veilCombo >= 20 && this.playerHp > 12) {
      this.supportState.veilCombo = combo;
      this.prepareSupport(supports, { id: 'veil', name: 'ブラッドカーヴ', damage: Math.max(1, Math.round(damage * .22)), cost: 6 });
    }
    if (this.hasCompanion('nox') && this.companionData.brothersReconciled) {
      if (wordEnded) this.supportState.noxPerfect = context.wordPerfect ? this.supportState.noxPerfect + 1 : 0;
      const gain = (wordEnded && context.wordPerfect ? 10 : 0) + (critical ? 8 : 0);
      if (gain && !this.ligatureActive) this.companionData.siblingGauge = Math.min(100, this.companionData.siblingGauge + gain);
      if (wordEnded && this.supportState.noxPerfect >= 5 && this.supportState.words - this.supportState.nox >= 5) {
        this.supportState.nox = this.supportState.words;
        this.prepareSupport(supports, { id: 'nox', name: 'レイズスラッシュ', damage: Math.max(1, Math.round(damage * .18)), siblingGauge: this.companionData.siblingGauge });
      }
      if (this.companionData.siblingGauge >= 100 && !this.ligatureActive) this.ligatureReady = true;
    }
    if (this.hasCompanion('senrin') && this.weakChar && char === this.weakChar) {
      this.prepareSupport(supports, { id: 'senrin', name: '天地調和', delay: 12 });
    }
    return supports;
  }

  miss() {
    this.burst = Math.max(0, this.burst - 10);
    let gaugeAdded = this.enemy.trait === 'disrupt' ? 15 : 10;
    let guarded = false;
    this.supportState.noxPerfect = 0;
    if (this.hasCompanion('nox') && this.companionData.brothersReconciled) {
      if (this.ligatureActive) {
        this.ligatureActive = false;
        this.ligatureReady = false;
        this.companionData.siblingGauge = 50;
      } else {
        this.companionData.siblingGauge = Math.max(0, this.companionData.siblingGauge - 12);
        if (this.companionData.siblingGauge < 100) this.ligatureReady = false;
      }
    }
    if (this.hasCompanion('glen') && this.supportState.words - this.supportState.glen >= 2) {
      this.supportState.glen = this.supportState.words;
      gaugeAdded = Math.max(4, gaugeAdded - 6);
      guarded = true;
    }
    this.attackGauge = Math.min(100, this.attackGauge + gaugeAdded);
    return { defeated: false, gaugeAdded, guarded };
  }

  tick(deltaSeconds) {
    if (!this.enemy || this.enemy.hp <= 0 || this.playerHp <= 0) return { attacked: false };
    const hpRate = this.enemy.hp / this.enemy.maxHp;
    const enraged = ['rage', 'sovereign'].includes(this.enemy.trait) && hpRate <= .3;
    const rageMultiplier = enraged ? (this.enemy.trait === 'sovereign' ? .75 : .7) : 1;
    const interval = this.enemy.attackInterval * rageMultiplier;
    this.attackGauge = Math.min(100, this.attackGauge + (100 / interval) * Math.min(.1, Math.max(0, deltaSeconds)));
    if (this.attackGauge < 100) return { attacked: false, enraged };
    this.attackGauge = 0;
    const guardBonus = this.hasCompanion('glen') ? .12 : 0;
    const damage = Math.max(1, Math.round(this.enemy.attack * Math.max(BATTLE_BALANCE.minimumDamageRate, 1 - this.stats.effects.guard - guardBonus)));
    this.playerHp = Math.max(0, this.playerHp - damage);
    let healed = 0;
    if (this.enemy.trait === 'leech') {
      healed = Math.round(damage * .5);
      this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + healed);
    }
    emit('battle:enemy-attack', { damage, healed });
    return { attacked: true, damage, healed, enraged, defeated: this.playerHp <= 0 };
  }

  useBurst() {
    if (this.burst < 100) return null;
    this.burstUses += 1;
    this.burst = 0;
    const shieldMultiplier = this.enemy.shieldBroken ? 1 : .3;
    const damage = Math.max(1, Math.round((this.enemy.hp * .25 + this.stats.atk * 5) * (1 + this.stats.effects.burstDamage) * shieldMultiplier));
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    if (!this.enemy.hp) {
      this.burstFinishers += 1;
      return { damage, ...this.defeatResult(true) };
    }
    return { damage, enemyDefeated: false };
  }

  collectReward() {
    if (this.enemy.rewardCollected) return null;
    this.enemy.rewardCollected = true;
    const stage = this.stage.id;
    const tier = this.enemy.tier;
    const earned = { gold: 0, xp: 0, kotonoha: 0, shard: 0 };
    if (tier === 'mob') {
      earned.gold = 15 + stage * 3;
      earned.xp = 12 + stage * 3;
    } else if (tier === 'mid') {
      earned.gold = 45 + stage * 5;
      earned.xp = 32 + stage * 5;
      earned.kotonoha = 1;
    } else {
      earned.gold = 150 + stage * 20;
      earned.xp = 120 + stage * 15;
      earned.shard = 1;
    }
    Object.keys(earned).forEach((key) => { this.rewards[key] += earned[key]; });
    this.profile.rpg.materials ??= { kotonoha: 0, shard: 0 };
    this.profile.rpg.gold += earned.gold;
    this.profile.rpg.xp += earned.xp;
    this.profile.rpg.materials.kotonoha += earned.kotonoha;
    this.profile.rpg.materials.shard += earned.shard;
    const records = ensureEnemyRecords(this.profile);
    records[this.enemy.id].kills += 1;
    const canDrop = !this.isGodBattle || this.enemy.godPhase === 4;
    const drop = canDrop ? rollEnemyDrop(this.enemy) : null;
    if (drop) {
      const inventory = ensureDropRecords(this.profile);
      inventory[drop.id] = Math.min(999999, (inventory[drop.id] || 0) + drop.count);
      const existing = this.rewards.drops.find((item) => item.id === drop.id);
      if (existing) existing.count += drop.count;
      else this.rewards.drops.push({ ...drop });
    }
    return { ...earned, drop };
  }

  defeatResult(fromBurst = false) {
    this.collectReward();
    const chain = this.enemy.trait === 'chain' && !this.enemy.chainCopy;
    this.chainPending = chain;
    return {
      enemyDefeated: true,
      stageCleared: !chain && this.waveIndex + 1 >= this.stage.waves.length,
      chain,
      fromBurst,
    };
  }

  advanceWave() {
    if (this.enemy.hp > 0) return { advanced: false };
    if (this.chainPending) {
      this.chainPending = false;
      this.enemy = this.spawn('twins', true);
      return { advanced: true, nextWave: false, chain: true };
    }
    this.waveIndex += 1;
    if (this.waveIndex >= this.stage.waves.length) return { stageCleared: true };
    this.enemy = this.spawn();
    return { advanced: true, nextWave: true, godPhase: this.enemy.godPhase || 0, phaseName: this.enemy.phaseName || '' };
  }
}
