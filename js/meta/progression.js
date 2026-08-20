import { CAMPAIGN_QUESTS, CAMPAIGN_STAGES, campaignNodeComplete, ensureCampaign } from '../rpg/campaign.js?v=enemy-art-batch-v50';

const today = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const clearedStages = (profile) => CAMPAIGN_STAGES.filter((stage) => {
  const bossQuest = stage.quests[stage.quests.length - 1];
  return Boolean(bossQuest && campaignNodeComplete(profile, bossQuest.id));
}).length;
const clearedCampaignQuests = (profile) => CAMPAIGN_QUESTS.filter((quest) => campaignNodeComplete(profile, quest.id)).length;
const clearedKings = (profile) => ensureCampaign(profile).kings.length;
const ownedWeapons = (profile) => profile.rpg?.weapons?.owned?.length || 1;

export const ACHIEVEMENTS = [
  { id: 'first_session', name: '最初の修復', text: '修練場またはクエストを1回完了する', check: (r) => (r.hits || 0) > 0 },
  { id: 'first_victory', name: '最初の勝利', text: 'クエストを初めて修復する', check: (r, p) => r.mode === 'BATTLE' || (p.rpg?.lifetime?.bossKills || 0) >= 1 },
  { id: 'perfect', name: '無欠の構文', text: '正確率100%で完了する', check: (r) => r.acc === 100 && (r.hits || 0) > 0 },
  { id: 'combo50', name: '連なる言葉', text: '50コンボを達成する', check: (r) => (r.combo || 0) >= 50 },
  { id: 'combo100', name: '途切れぬ文章', text: '100コンボを達成する', check: (r) => (r.combo || 0) >= 100 },
  { id: 'wpm60', name: '高速筆記', text: 'WPM 60を達成する', check: (r) => (r.wpm || 0) >= 60 },
  { id: 'wpm100', name: '音速の記述者', text: 'WPM 100を達成する', check: (r) => (r.wpm || 0) >= 100 },
  { id: 'keys1000', name: '千の文字', text: '累計1,000打鍵を記録する', check: (_, p) => (p.rpg?.lifetime?.keystrokes || 0) >= 1000 },
  { id: 'keys10000', name: '万字の記憶', text: '累計10,000打鍵を記録する', check: (_, p) => (p.rpg?.lifetime?.keystrokes || 0) >= 10000 },
  { id: 'level10', name: '熟練シフター', text: 'レベル10に到達する', check: (_, p) => (p.rpg?.level || 1) >= 10 },
  { id: 'level20', name: '言霊の達人', text: 'レベル20に到達する', check: (_, p) => (p.rpg?.level || 1) >= 20 },
  { id: 'boss3', name: '侵食を断つ者', text: 'クエストを累計3回修復する', check: (_, p) => (p.rpg?.lifetime?.bossKills || 0) >= 3 },
  { id: 'boss6', name: '六界の守護者', text: '6体の大ボスを倒し、全6ステージを修復する', check: (_, p) => clearedStages(p) >= 6 },
  { id: 'all_quests', name: '完全踏破', text: '三章にある30クエストをすべて修復する', check: (_, p) => clearedCampaignQuests(p) >= CAMPAIGN_QUESTS.length },
  { id: 'three_kings', name: '王権を断つ者', text: '叡智・戦炎・死魂の三王を撃破する', check: (_, p) => clearedKings(p) >= 3 },
  { id: 'all_stages', name: '世界の再記述', text: '六界と三王を越え、文字創世神を撃破する', check: (_, p) => ensureCampaign(p).godCleared },
  { id: 'all_keys', name: '完全な鍵盤', text: '48キーをすべて解放する', check: (_, p) => (p.unlocked || 0) >= 48 },
  { id: 'weapon_collector', name: '剣の記録者', text: '4種類の武器を図鑑へ登録する', check: (_, p) => new Set([...(p.meta?.codex?.weapons || []), ...(p.rpg?.weapons?.owned || [])]).size >= 4 || ownedWeapons(p) >= 4 },
];

export const TITLES = [
  { id: 'nameless', name: '名もなき修復者', text: '世界へ踏み出したシフターの証。', effectText: '能力補正なし', effect: {} },
  { id: 'first_record', name: 'はじまりの記録', text: '最初の修復を記録した証。', achievement: 'first_session', effectText: '最大HP +3%', effect: { hp: .03 } },
  { id: 'null_breaker', name: 'ヌル討伐者', text: '初めて侵食体を退けた証。', achievement: 'first_victory', effectText: '被ダメージ -2%', effect: { guard: .02 } },
  { id: 'perfect_editor', name: '無欠の校正者', text: '一度も誤らず文章を結んだ証。', achievement: 'perfect', effectText: '会心率 +2%', effect: { crit: .02 } },
  { id: 'chain_swordsman', name: '連文の剣士', text: '言葉を途切れぬ剣閃へ変えた証。', achievement: 'combo50', effectText: '攻撃力 +3%', effect: { atk: .03 } },
  { id: 'swift_shifter', name: '疾筆のシフター', text: '高速入力の領域へ到達した証。', achievement: 'wpm60', effectText: 'Burst獲得 +5%', effect: { burst: .05 } },
  { id: 'archive_guardian', name: 'アーカイブの守護者', text: '六つの世界を修復した証。', achievement: 'boss6', effectText: '最大HP +5%', effect: { hp: .05 } },
  { id: 'sovereign_breaker', name: '三王の超越者', text: '三つの王権を断ち切った証。', achievement: 'three_kings', effectText: '会心率 +3%', effect: { crit: .03 } },
  { id: 'word_liberator', name: '言霊の解放者', text: '創世の文を越え、世界を最後まで再記述した証。', achievement: 'all_stages', effectText: '攻撃力 +5%', effect: { atk: .05 } },
];

const CAMPAIGN_ACHIEVEMENT_IDS = new Set(['boss6', 'all_quests', 'three_kings', 'all_stages']);

function reconcileCampaignAchievements(profile) {
  profile.meta.achievements = profile.meta.achievements.filter((id) => {
    if (!CAMPAIGN_ACHIEVEMENT_IDS.has(id)) return true;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    return Boolean(achievement?.check({}, profile));
  });
}

function dateDistance(from, to) {
  if (!from) return Number.POSITIVE_INFINITY;
  return Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000);
}

export function ensureDaily(profile) {
  profile.meta.daily ??= { day: '', missions: [], streak: 0 };
  const day = today();
  if (profile.meta.daily.day === day) {
    profile.meta.daily.missions.forEach((mission) => { mission.claimed ??= false; });
    return profile.meta.daily.missions;
  }
  const previous = profile.meta.daily.day;
  const streak = dateDistance(previous, day) === 1 ? (profile.meta.daily.streak || 0) + 1 : 1;
  profile.meta.daily = { day, streak, missions: [
    { id: 'keys', text: '100文字入力', target: 100, progress: 0, reward: 30, claimed: false },
    { id: 'session', text: '修練・クエストを1回完了', target: 1, progress: 0, reward: 50, claimed: false },
    { id: 'accuracy', text: '正確率95%以上', target: 1, progress: 0, reward: 40, claimed: false },
  ] };
  return profile.meta.daily.missions;
}

export function addBond(profile, amount) {
  profile.meta.bond ??= { level: 1, points: 0, total: 0, lastLoginDay: '' };
  const bond = profile.meta.bond;
  const before = bond.level;
  bond.total += amount;
  bond.points += amount;
  while (bond.level < 10) {
    const required = bond.level * 40;
    if (bond.points < required) break;
    bond.points -= required;
    bond.level += 1;
  }
  if (bond.level >= 10) bond.points = 0;
  return Math.max(0, bond.level - before);
}

export function ensureMetaProgression(profile) {
  profile.meta ??= {};
  profile.meta.achievements ??= [];
  profile.meta.titles ??= { owned: [], equipped: null };
  profile.meta.titles.owned ??= [];
  profile.meta.bond ??= { level: 1, points: 0, total: 0, lastLoginDay: '' };
  if (!profile.meta.titles.owned.includes('nameless')) profile.meta.titles.owned.unshift('nameless');
  reconcileCampaignAchievements(profile);
  ensureDaily(profile);
  const day = today();
  let loginBond = 0;
  if (profile.meta.bond.lastLoginDay !== day) {
    profile.meta.bond.lastLoginDay = day;
    addBond(profile, 10);
    loginBond = 10;
  }
  ACHIEVEMENTS.forEach((achievement) => {
    if (!profile.meta.achievements.includes(achievement.id) && achievement.check({}, profile)) profile.meta.achievements.push(achievement.id);
  });
  syncTitles(profile);
  if (!profile.meta.titles.owned.includes(profile.meta.titles.equipped)) profile.meta.titles.equipped = 'nameless';
  return { loginBond };
}

export function syncTitles(profile) {
  profile.meta.titles ??= { owned: ['nameless'], equipped: 'nameless' };
  profile.meta.titles.owned = profile.meta.titles.owned.filter((id) => {
    const title = TITLES.find((item) => item.id === id);
    return Boolean(title && (!title.achievement || profile.meta.achievements.includes(title.achievement)));
  });
  if (!profile.meta.titles.owned.includes('nameless')) profile.meta.titles.owned.unshift('nameless');
  TITLES.forEach((title) => {
    const earned = !title.achievement || profile.meta.achievements.includes(title.achievement);
    if (earned && !profile.meta.titles.owned.includes(title.id)) profile.meta.titles.owned.push(title.id);
  });
}

export function getTitle(profile, id = profile.meta?.titles?.equipped) {
  return TITLES.find((title) => title.id === id) || TITLES[0];
}

export function equipTitle(profile, id) {
  ensureMetaProgression(profile);
  if (!profile.meta.titles.owned.includes(id)) return false;
  profile.meta.titles.equipped = id;
  return true;
}

export function bondProgress(profile) {
  const bond = profile.meta?.bond || { level: 1, points: 0 };
  const required = bond.level >= 10 ? 1 : bond.level * 40;
  return { ...bond, required, rate: bond.level >= 10 ? 100 : Math.round(bond.points / required * 100) };
}

export function metaCombatBonuses(profile) {
  const level = profile.meta?.bond?.level || 1;
  const title = getTitle(profile);
  const effect = { atk: 0, crit: 0, hp: 0, guard: 0, burst: 0, startBurst: 0 };
  Object.entries(title.effect || {}).forEach(([key, value]) => { effect[key] += value; });
  effect.hp += Math.max(0, level - 1) * .01;
  if (level >= 3) effect.guard += .02;
  if (level >= 5) effect.startBurst += 10;
  if (level >= 7) effect.atk += .03;
  if (level >= 10) effect.crit += .03;
  return effect;
}

export function applySessionMeta(profile, result) {
  ensureMetaProgression(profile);
  const achievementIdsBefore = new Set(profile.meta.achievements);
  const titleIdsBefore = new Set(profile.meta.titles.owned);
  ACHIEVEMENTS.forEach((achievement) => {
    if (!profile.meta.achievements.includes(achievement.id) && achievement.check(result, profile)) profile.meta.achievements.push(achievement.id);
  });
  syncTitles(profile);

  let dailyGold = 0;
  profile.meta.daily.missions.forEach((mission) => {
    if (mission.id === 'keys') mission.progress = Math.min(mission.target, mission.progress + (result.hits || 0));
    if (mission.id === 'session') mission.progress = Math.min(mission.target, mission.progress + 1);
    if (mission.id === 'accuracy' && result.acc >= 95) mission.progress = 1;
    if (mission.progress >= mission.target && !mission.claimed) {
      mission.claimed = true;
      dailyGold += mission.reward;
    }
  });
  profile.rpg.gold += dailyGold;
  const bondEarned = 8 + (result.mode === 'BATTLE' ? 4 : 0) + (result.acc === 100 ? 2 : 0);
  const bondLevels = addBond(profile, bondEarned);
  return {
    achievements: ACHIEVEMENTS.filter((item) => !achievementIdsBefore.has(item.id) && profile.meta.achievements.includes(item.id)).map((item) => item.name),
    titles: TITLES.filter((item) => !titleIdsBefore.has(item.id) && profile.meta.titles.owned.includes(item.id)).map((item) => item.name),
    dailyGold,
    bondEarned,
    bondLevels,
  };
}

export const STORY = [
  { id: 'prologue', chapter: '序章', label: 'THE FIRST LETTER', title: '欠けた名前', text: '崩壊した世界で、レンは自分と弟の名に連なる最初の文字を拾う。', body: ['文字が魔法コードとして世界を支えていた時代は終わり、都市も記憶も欠けた文章のように崩れていた。', 'レン・アスターは、青く光る一文字に触れる。それは失われた名を呼び戻し、六つの世界へ続く道を開いた。'], requirement: { type: 'always' }, unlockText: '最初から閲覧可能' },
  { id: 'stage-01-memory', chapter: '第1章', label: 'STAGE 01 · RESTORED', title: '同じ名を持つ弟', text: '虚無の機械神を破り、レンは生き別れた弟ノクスを救い出す。', body: ['魔都の中心炉に拘束されていた青年は、レンと同じ家名を持っていた。失われた記憶が戻るにつれ、二人の幼い日の約束が青い文字列となって浮かび上がる。', '兄のレンと弟のノクス。長い断絶は消えない。それでも二人は、今度こそ同じ行に立つことを選ぶ。'], requirement: { type: 'node', id: 'quest-01-05' }, unlockText: 'ステージ1「機械神ガイアス」をクリア' },
  { id: 'stage-02-memory', chapter: '第1章', label: 'STAGE 02 · RESTORED', title: '森が覚えていた声', text: '闇竜の混沌を鎮め、魔森とリリアの魔導記憶を取り戻す。', body: ['侵食された根は、森に生きた者たちの言葉を別の意味へ変えていた。リリアは残された声を魔導書へ集め、本来の文脈へ編み直す。', '二つの世界を修復したとき、止まっていた時の王座が動き始める。'], requirement: { type: 'node', id: 'quest-02-05' }, unlockText: 'ステージ2「闇竜ヴォルカリオン」をクリア' },
  { id: 'king-01-memory', chapter: '第1章', label: 'SOVEREIGN I · BROKEN', title: '止まった時間の向こう', text: '叡智の王クロノスを越え、変化する未来を選び取る。', body: ['クロノスは喪失をなくすため、世界を完成した一秒へ固定しようとした。けれど止まった時間には、再会も成長も生まれない。', 'レンたちは不完全な明日を選び、時の王権を破壊する。'], requirement: { type: 'node', id: 'king-01' }, unlockText: '第1王「クロノス」を撃破' },
  { id: 'stage-03-memory', chapter: '第2章', label: 'STAGE 03 · RESTORED', title: '守護者の誓い', text: '聖樹の暴走命令を解き、グレンと生命圏を救出する。', body: ['守るための命令は、いつしか外から来るすべてを拒む檻へ変わっていた。グレンは盾を下ろさず、それでも命令ではなく意志で守る道を選ぶ。', '聖樹は再び風を通し、閉ざされていた大地へ新しい言葉が芽吹く。'], requirement: { type: 'node', id: 'quest-03-05' }, unlockText: 'ステージ3「守護者セレスティア」をクリア' },
  { id: 'stage-04-memory', chapter: '第2章', label: 'STAGE 04 · RESTORED', title: '戦火を終える矢', text: '炎獣の王権核を砕き、フィオナが見つけた退路を帰還路へ変える。', body: ['火山国に残された戦争命令は、敵が消えたあとも兵器と炎獣を動かし続けていた。フィオナの矢は命令文の継ぎ目を射抜く。', '帰る場所を作ることも戦いだと知り、仲間たちは戦炎の王へ進む。'], requirement: { type: 'node', id: 'quest-04-05' }, unlockText: 'ステージ4「炎獣アグニロス」をクリア' },
  { id: 'king-02-memory', chapter: '第2章', label: 'SOVEREIGN II · BROKEN', title: '一つではない旗', text: '戦炎の王を破り、異なる声が共存できる世界を示す。', body: ['エアポカリオンは、争いを終わらせるため全生命を一つの軍旗へ従わせようとした。', '仲間たちの異なる力が一つの連携となり、服従ではない結束が戦炎を上回る。'], requirement: { type: 'node', id: 'king-02' }, unlockText: '第2王「エアポカリオン」を撃破' },
  { id: 'stage-05-memory', chapter: '第3章', label: 'STAGE 05 · RESTORED', title: '凍らない記憶', text: '永遠の静止を拒み、セレストと氷海に眠る魂を解放する。', body: ['傷つかないために凍結された記憶は、喜びも声も失っていた。セレストの光は、痛みを消すのではなく抱えて進むための温度を与える。', '氷海が流れ始め、天へ続く最後の文字橋が姿を現す。'], requirement: { type: 'node', id: 'quest-05-05' }, unlockText: 'ステージ5「フロストノヴァ」をクリア' },
  { id: 'stage-06-memory', chapter: '第3章', label: 'STAGE 06 · RESTORED', title: '静・流・識', text: '三つの試練を越え、希少な仙人センリンを最後の仲間に迎える。', body: ['静は正確さ、流は速度、識は自分の弱さを知ること。センリンの試練は強さではなく、打ち直し続ける意志を測っていた。', '六人の声が揃い、天空城の最上部で死魂の王座が開く。'], requirement: { type: 'node', id: 'quest-06-05' }, unlockText: 'ステージ6「ライディンガルド」をクリア' },
  { id: 'king-03-memory', chapter: '第3章', label: 'SOVEREIGN III · BROKEN', title: '終わりに抗う名前', text: '死魂の王から仲間の魂を奪還し、六界の物語を結び直す。', body: ['ネクロスは、別れの痛みから世界を救うため、すべての魂を静かな終焉へ閉じ込めようとした。', 'レンは終わりがあるからこそ今呼ぶ名前に意味があると答え、最後の王権を断ち切る。'], requirement: { type: 'node', id: 'king-03' }, unlockText: '第3王「ネクロス」を撃破' },
  { id: 'divine-gate', chapter: '特別章', label: 'DIVINE CHALLENGE · OPEN', title: '創世文字界への門', text: '三王の王印と六人の声が重なり、文字創世神へ至る門が開く。', body: ['三つの王権から解放された文字が、空に巨大な一文を描く。その末尾に現れたのは、世界の起源へ直接接続する門だった。', 'センリンは告げる。この先では、正しい文章ではなく、誰が世界を書くのかが問われる。'], requirement: { type: 'kings' }, unlockText: '三王をすべて撃破' },
  { id: 'epilogue', chapter: '終章', label: 'ORIGIN SHIFT · COMPLETE', title: '続きを書く者たち', text: '創世神を越えた七人は、完成稿ではなく書き続けられる世界を選ぶ。', body: ['アルファ・オリジンの因果律を越え、レンは世界を一人の作者から解放した。六人の仲間と重ねた言葉が、消えかけた空と大地を再構築していく。', '戦いが終わっても文章は完成しない。兄弟も仲間も、それぞれの言葉で明日を一文字ずつ書き足していく。'], requirement: { type: 'god' }, unlockText: '文字創世神アルファ・オリジンを撃破' },
];

export function storyArchive(profile) {
  const campaign = ensureCampaign(profile);
  const seen = new Set(profile.meta?.story?.seen || []);
  return STORY.map((entry) => {
    const requirement = entry.requirement || { type: 'always' };
    const unlocked = requirement.type === 'always'
      || (requirement.type === 'node' && campaignNodeComplete(profile, requirement.id))
      || (requirement.type === 'kings' && campaign.kings.length >= 3)
      || (requirement.type === 'god' && campaign.godCleared);
    return { ...entry, unlocked, seen: seen.has(entry.id) };
  });
}
