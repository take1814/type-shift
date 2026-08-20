export const COMPANIONS = [
  {
    id: 'nox',
    no: '01',
    name: 'ノクス・アスター',
    label: 'NOX',
    role: 'アタッカー',
    element: 'blue',
    color: '#3f8cff',
    weapon: '片手剣',
    art: 'assets/companions/nox-v1.png',
    unlockStage: 1,
    supportName: 'レイズスラッシュ',
    supportText: '高コンボ時、兄弟ゲージを溜めながら追撃。',
    story: 'レンの生き別れの弟。魔都で改ざんされた記憶を取り戻し、最初の仲間として正式加入する。',
    sibling: true,
  },
  {
    id: 'lilia',
    no: '02',
    name: 'リリア',
    label: 'LILIA',
    role: 'メイジ',
    element: 'violet',
    color: '#b48cff',
    weapon: '魔導書',
    art: 'assets/companions/lilia-v1.png',
    unlockStage: 2,
    supportName: 'ルーンストーム',
    supportText: '単語完成時、Burstゲージを追加獲得。',
    story: '侵食された魔森で記憶を封じられていた魔導士。広域処理が得意。',
  },
  {
    id: 'glen',
    no: '03',
    name: 'グレン',
    label: 'GLEN',
    role: 'タンク',
    element: 'flame',
    color: '#ff6b4a',
    weapon: '大剣',
    art: 'assets/companions/glen-v1.png',
    unlockStage: 3,
    supportName: 'ソウルバリア',
    supportText: '被弾時、一定間隔でダメージを軽減。',
    story: '聖樹を守る前衛として残った戦士。荒っぽいが仲間思い。',
  },
  {
    id: 'fiona',
    no: '04',
    name: 'フィオナ',
    label: 'FIONA',
    role: 'レンジャー',
    element: 'forest',
    color: '#7edc6a',
    weapon: '弓',
    art: 'assets/companions/fiona-v1.png',
    unlockStage: 4,
    supportName: 'シャドウトラップ',
    supportText: '単語完成時、一定間隔で追撃ダメージ。',
    story: '火山国の戦線を単独で偵察していた斥候。遠距離から戦況を整える。',
  },
  {
    id: 'celeste',
    no: '05',
    name: 'セレスト',
    label: 'CELESTE',
    role: 'ヒーラー',
    element: 'light',
    color: '#f0d17a',
    weapon: '杖',
    art: 'assets/companions/celeste-v1.png',
    unlockStage: 5,
    supportName: 'ホーリーライト',
    supportText: '単語を数回完成させるたびにHPを回復。',
    story: '凍結の氷海で魂の声を守っていた治癒術師。状態異常の浄化も担う。',
  },
  {
    id: 'senrin',
    no: '06',
    name: 'センリン',
    label: 'SENRIN',
    role: '仙人／サポート',
    element: 'aqua',
    color: '#61e6e6',
    weapon: '扇／符',
    art: 'assets/companions/senrin-v1.png',
    unlockStage: 6,
    supportName: '天地調和',
    supportText: '弱点入力時、敵の攻撃ゲージを遅らせる。',
    story: '最後の真実を知る希少な導師。三つの試練を越えた者だけに同行する。',
    rare: true,
  },
];

const COMPANION_IDS = new Set(COMPANIONS.map((item) => item.id));
const RESCUE_BY_STAGE = {
  1: 'nox',
  2: 'lilia',
  3: 'glen',
  4: 'fiona',
  5: 'celeste',
  6: 'senrin',
};

export function companionById(id) {
  return COMPANIONS.find((item) => item.id === id) || null;
}

export function ensureCompanions(profile) {
  profile.rpg ??= {};
  profile.rpg.companions ??= {};
  const data = profile.rpg.companions;
  data.legacyCompanions = data.legacyCompanions && typeof data.legacyCompanions === 'object' ? data.legacyCompanions : {};
  if (!data.rosterV2Applied) {
    const legacyRescued = Array.isArray(data.rescued) && data.rescued.includes('veil');
    const legacyInParty = Array.isArray(data.party) && data.party.includes('veil');
    const legacyBond = data.bond?.veil;
    const legacyTrial = data.rescueTrials?.veil;
    if (legacyRescued || legacyInParty || legacyBond || legacyTrial) {
      data.legacyCompanions.veil = {
        rescued: Boolean(legacyRescued),
        inParty: Boolean(legacyInParty),
        bond: legacyBond && typeof legacyBond === 'object' ? { ...legacyBond } : null,
        rescueTrial: legacyTrial && typeof legacyTrial === 'object' ? { ...legacyTrial } : null,
        archivedAt: Date.now(),
      };
    }
    data.rosterV2Applied = true;
  }
  data.migrationApplied = Boolean(data.migrationApplied);
  data.rescued = Array.isArray(data.rescued) ? [...new Set(data.rescued.filter((id) => COMPANION_IDS.has(id)))] : [];
  data.party = Array.isArray(data.party) ? [...new Set(data.party.filter((id) => data.rescued.includes(id)).slice(0, 2))] : [];
  data.brothersReconciled = Boolean(data.brothersReconciled || data.rescued.includes('nox'));
  data.noxProvisional = false;
  data.bond ??= {};
  COMPANIONS.forEach((item) => {
    const current = data.bond[item.id] || {};
    const defaultRank = data.rescued.includes(item.id) ? 1 : 0;
    data.bond[item.id] = {
      rank: Math.max(0, Math.min(5, Math.round(Number(current.rank) || defaultRank))),
      points: Math.max(0, Math.round(Number(current.points) || 0)),
      seen: Array.isArray(current.seen) ? [...new Set(current.seen.filter((id) => typeof id === 'string'))].slice(0, 10) : [],
    };
  });
  data.siblingGauge = Math.max(0, Math.min(100, Math.round(Number(data.siblingGauge) || 0)));
  data.senrinTrials ??= { still: false, flow: false, insight: false, failures: 0 };
  data.senrinTrials = {
    still: Boolean(data.senrinTrials.still),
    flow: Boolean(data.senrinTrials.flow),
    insight: Boolean(data.senrinTrials.insight),
    failures: Math.max(0, Math.round(Number(data.senrinTrials.failures) || 0)),
    attempts: Math.max(0, Math.round(Number(data.senrinTrials.attempts) || 0)),
    recalibrated: Boolean(data.senrinTrials.recalibrated),
  };
  data.rescueTrials ??= {};
  COMPANIONS.forEach((item) => {
    const trial = data.rescueTrials[item.id] || {};
    data.rescueTrials[item.id] = {
      attempts: Math.max(0, Math.round(Number(trial.attempts) || 0)),
      cleared: Boolean(trial.cleared || data.rescued.includes(item.id)),
      lastReason: typeof trial.lastReason === 'string' ? trial.lastReason.slice(0, 180) : '',
    };
  });
  data.noxRevealed = Boolean(data.noxRevealed || data.rescued.includes('nox'));
  data.finalUnlocked = COMPANIONS.every((item) => data.rescued.includes(item.id));
  return data;
}

export function activeCompanions(profile) {
  const data = ensureCompanions(profile);
  return data.party.map(companionById).filter(Boolean);
}

export function rescuePreview(stageId) {
  const id = RESCUE_BY_STAGE[stageId];
  return id ? companionById(id) : null;
}

export function isStagePlayable(profile, stage) {
  ensureCompanions(profile);
  return stage.id <= 6 && stage.id <= (profile.rpg?.quest?.unlockedStage || 1);
}

export function grantRescueForStage(profile, stageId, stars = 1, evaluation = { passed: true, reason: '' }) {
  const data = ensureCompanions(profile);
  const id = RESCUE_BY_STAGE[stageId];
  if (!id || data.rescued.includes(id)) return { rescued: null, blocked: false };
  const trial = data.rescueTrials[id];
  trial.attempts += 1;
  if (!evaluation.passed) {
    trial.lastReason = evaluation.reason || '救出条件を満たしていません。';
    return { rescued: null, blocked: true, reason: trial.lastReason, conditions: evaluation.conditions || [] };
  }
  data.rescued.push(id);
  trial.cleared = true;
  trial.lastReason = '';
  if (data.party.length < 2) data.party.push(id);
  if (id === 'nox') {
    data.noxRevealed = true;
    data.noxProvisional = false;
    data.brothersReconciled = true;
    data.bond.nox.rank = Math.max(1, data.bond.nox.rank);
  }
  if (id === 'senrin') {
    data.senrinTrials.still = true;
    data.senrinTrials.flow = true;
    data.senrinTrials.insight = true;
  }
  data.finalUnlocked = COMPANIONS.every((item) => data.rescued.includes(item.id));
  return { rescued: companionById(id), blocked: false };
}

export function syncHistoricalRescues(profile) {
  const data = ensureCompanions(profile);
  const cleared = profile.rpg?.quest?.cleared || {};
  if (!data.migrationApplied) {
    const legacyRescueByStage = { 1: 'fiona', 2: 'glen', 3: 'lilia', 4: 'celeste', 6: 'nox', 7: 'senrin' };
    Object.entries(legacyRescueByStage).forEach(([stage, id]) => {
      if (!cleared[stage] || data.rescued.includes(id)) return;
      data.rescued.push(id);
      data.rescueTrials[id].cleared = true;
      if (data.party.length < 2) data.party.push(id);
    });
    if (cleared[5]) {
      data.legacyCompanions.veil = {
        ...(data.legacyCompanions.veil || {}),
        rescued: true,
        archivedAt: data.legacyCompanions.veil?.archivedAt || Date.now(),
      };
    }
    data.migrationApplied = true;
  }

  const campaignCleared = profile.rpg?.campaign?.questCleared || {};
  Object.entries(RESCUE_BY_STAGE).forEach(([stage, id]) => {
    const questId = `quest-${String(stage).padStart(2, '0')}-05`;
    if (!campaignCleared[questId] || data.rescued.includes(id)) return;
    data.rescued.push(id);
    data.rescueTrials[id].cleared = true;
    if (data.party.length < 2) data.party.push(id);
  });
  data.senrinTrials.still ||= Boolean(campaignCleared['quest-06-01']);
  data.senrinTrials.flow ||= Boolean(campaignCleared['quest-06-02']);
  data.senrinTrials.insight ||= Boolean(campaignCleared['quest-06-03']);
  data.noxRevealed = data.noxRevealed || data.rescued.includes('nox');
  data.brothersReconciled ||= data.rescued.includes('nox');
  data.noxProvisional = false;
  data.finalUnlocked = COMPANIONS.every((item) => data.rescued.includes(item.id));
  return data;
}

const condition = (label, passed, current, target) => ({ label, passed: Boolean(passed), current, target });

export function evaluateRescueTrial(profile, stageId, result, battle) {
  const data = ensureCompanions(profile);
  const hpRate = battle ? battle.playerHp / battle.playerMaxHp : 0;
  let conditions = [];
  if (stageId === 1) conditions = [condition('正確率', result.acc >= 88, `${result.acc}%`, '88%以上'), condition('ミス', result.miss <= 10, result.miss, '10以下'), condition('完成単語', result.words >= 8, result.words, '8以上')];
  if (stageId === 2) conditions = [condition('正確率', result.acc >= 90, `${result.acc}%`, '90%以上'), condition('精密防御', (battle?.precisionGuards || 0) >= 2, battle?.precisionGuards || 0, '2回'), condition('残りHP', hpRate >= .25, `${Math.round(hpRate * 100)}%`, '25%以上')];
  if (stageId === 3) conditions = [condition('長文単語', result.longWords >= 8, result.longWords, '8以上'), condition('正確率', result.acc >= 92, `${result.acc}%`, '92%以上')];
  if (stageId === 4) conditions = [condition('正確率', result.acc >= 94, `${result.acc}%`, '94%以上'), condition('ミス', result.miss <= 6, result.miss, '6以下'), condition('継続時間', result.playMs >= 60000, `${Math.round(result.playMs / 1000)}秒`, '60秒')];
  if (stageId === 5) conditions = [condition('最大コンボ', result.combo >= 40, result.combo, '40以上'), condition('Burst決着', (battle?.burstFinishers || 0) >= 1, battle?.burstFinishers || 0, '1回'), condition('正確率', result.acc >= 93, `${result.acc}%`, '93%以上')];
  if (stageId === 6) conditions = [condition('正確率', result.acc >= 94, `${result.acc}%`, '94%以上'), condition('完全単語', result.perfectWords >= 8, result.perfectWords, '8以上'), condition('記憶復元ミス', result.miss === 0, result.miss, '0')];
  if (stageId === 7) {
    const history = profile.history.slice(0, 8);
    const average = history.length ? history.reduce((sum, item) => sum + (item.wpm || 0), 0) / history.length : 30;
    data.senrinTrials.attempts += 1;
    if (data.senrinTrials.failures >= 5) data.senrinTrials.recalibrated = true;
    const targetWpm = Math.max(24, Math.round(average * (data.senrinTrials.recalibrated ? 1.05 : 1.1)));
    const still = result.acc >= 97 && result.miss <= 3 && (battle?.burstUses || 0) === 0;
    const flow = result.wpm >= targetWpm && result.combo >= 50 && result.symbolWords >= 8;
    const insight = result.acc >= 96 && result.miss <= 5 && (battle?.weakHits || 0) >= 5;
    data.senrinTrials.still ||= still;
    data.senrinTrials.flow ||= flow;
    data.senrinTrials.insight ||= insight;
    if (!(still || flow || insight)) data.senrinTrials.failures += 1;
    conditions = [
      condition('第一試練「静」', data.senrinTrials.still, still ? '今回達成' : '未達', '正確率97%・ミス3以下・Burst禁止'),
      condition('第二試練「流」', data.senrinTrials.flow, flow ? '今回達成' : `${result.wpm} WPM / ${result.combo} COMBO / 記号${result.symbolWords}`, `${targetWpm} WPM・50コンボ・記号8語`),
      condition('第三試練「識」', data.senrinTrials.insight, insight ? '今回達成' : `弱点${battle?.weakHits || 0}回 / ミス${result.miss}`, '正確率96%・弱点5回・ミス5以下'),
    ];
  }
  const passed = conditions.length > 0 && conditions.every((item) => item.passed);
  const unmet = conditions.filter((item) => !item.passed).map((item) => `${item.label}（${item.current} / ${item.target}）`);
  return { passed, conditions, reason: passed ? '' : `未達成: ${unmet.join('、')}` };
}

export function applyCompanionBattleBond(profile, result, activeIds = []) {
  const data = ensureCompanions(profile);
  const updated = [];
  activeIds.filter((id) => data.rescued.includes(id)).forEach((id) => {
    const bond = data.bond[id];
    const before = bond.rank;
    bond.points += 12 + (result.acc >= 95 ? 4 : 0) + (result.acc === 100 ? 4 : 0);
    const thresholds = [0, 0, 60, 150, 280, 450];
    while (bond.rank < 5 && bond.points >= thresholds[bond.rank + 1]) bond.rank += 1;
    if (bond.rank > before) updated.push({ id, rank: bond.rank });
  });
  let reconciled = false;
  if (data.noxProvisional && activeIds.includes('nox') && result.acc >= 94 && result.perfectWords >= 5) {
    data.noxProvisional = false;
    data.brothersReconciled = true;
    data.bond.nox.rank = Math.max(1, data.bond.nox.rank);
    reconciled = true;
  }
  return { updated, reconciled };
}

export function companionBondProgress(profile, id) {
  const data = ensureCompanions(profile);
  const bond = data.bond[id] || { rank: 0, points: 0 };
  const thresholds = [0, 0, 60, 150, 280, 450];
  const next = bond.rank >= 5 ? thresholds[5] : thresholds[bond.rank + 1];
  const previous = thresholds[Math.max(1, bond.rank)] || 0;
  return { ...bond, next, rate: bond.rank >= 5 ? 100 : Math.max(0, Math.min(100, Math.round((bond.points - previous) / Math.max(1, next - previous) * 100))) };
}

export function setCompanionParty(profile, id) {
  const data = ensureCompanions(profile);
  if (!data.rescued.includes(id)) return false;
  if (data.party.includes(id)) {
    data.party = data.party.filter((item) => item !== id);
    return true;
  }
  if (data.party.length >= 2) data.party.shift();
  data.party.push(id);
  return true;
}

export function companionPortrait(companion, { locked = false, compact = false } = {}) {
  const label = locked ? 'LOCK' : companion.label;
  const alt = locked ? '未救出の仲間のシルエット' : `${companion.name}の正式立ち絵`;
  const loading = compact ? 'eager' : 'lazy';
  return `<figure class="companion-portrait ${compact ? 'compact' : ''} ${locked ? 'locked' : ''} role-${companion.id}" style="--companion:${companion.color}" aria-label="${companion.name}"><img src="${companion.art}" alt="${alt}" loading="${loading}" decoding="async"><span class="companion-no">${companion.no}</span><i class="companion-sigil"></i>${locked ? '<b>?</b>' : ''}<small>${label}</small></figure>`;
}

export function companionUnlockProgress(profile) {
  const data = ensureCompanions(profile);
  return {
    rescued: data.rescued.length,
    total: COMPANIONS.length,
    party: activeCompanions(profile),
    finalUnlocked: data.finalUnlocked,
    siblingGauge: data.siblingGauge,
  };
}
