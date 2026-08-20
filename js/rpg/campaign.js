const quest = (stageId, index, title, type, description, recommended) => ({
  id: `quest-${String(stageId).padStart(2, '0')}-${String(index).padStart(2, '0')}`,
  kind: 'quest',
  stageId,
  battleStageId: stageId,
  questIndex: index,
  title,
  type,
  description,
  recommended,
});

const stage = ({ id, name, label, element, color, boss, companion, recommended, quests }) => ({
  id: `stage-${String(id).padStart(2, '0')}`,
  numericId: id,
  battleStageId: id,
  name,
  label,
  element,
  color,
  boss,
  companion,
  recommended,
  quests: quests.map((item, index) => quest(id, index + 1, item[0], item[1], item[2], recommended + index)),
});

export const CAMPAIGN_CHAPTERS = [
  {
    id: 'chapter-01',
    no: 'I',
    title: '時の秩序と虚無',
    subtitle: '崩れた都市と魔森に、失われた時間の意味を取り戻す。',
    color: '#667cff',
    king: {
      id: 'king-01',
      kind: 'king',
      title: '叡智の王クロノス',
      label: 'SOVEREIGN OF ORDER',
      description: '二つの世界を固定する、時空と秩序の王。',
      battleStageId: 2,
      recommended: 8,
    },
    stages: [
      stage({
        id: 1,
        name: '崩壊した魔都',
        label: 'FALLEN ARCANE CAPITAL',
        element: '闇・機械',
        color: '#667cff',
        boss: '虚無の機械神ガイアス',
        companion: 'ノクス',
        recommended: 1,
        quests: [
          ['魔都への降下', 'ARRIVAL', '崩壊した外壁から、魔都の文字回路へ侵入する。'],
          ['失われた通り名', 'SEARCH', '名を奪われた街路で、ノクスの記憶反応を追う。'],
          ['機械兵の包囲', 'ELITE', '虚無炉を守る機械兵団の包囲を突破する。'],
          ['虚無炉への道', 'VANGUARD', 'ガイアスの中枢へ続く重力回廊を解放する。'],
          ['機械神ガイアス', 'MAIN BOSS', '虚無核を破壊し、崩壊した魔都を修復する。'],
        ],
      }),
      stage({
        id: 2,
        name: '侵食された魔森',
        label: 'CORRUPTED WITCHWOOD',
        element: '闇・竜',
        color: '#38a98b',
        boss: '混沌の闇竜ヴォルカリオン',
        companion: 'リリア',
        recommended: 5,
        quests: [
          ['魔森の入口', 'ARRIVAL', '文字化した蔦を切り払い、魔森の深部へ進む。'],
          ['侵食する根', 'SEARCH', '巨大樹を蝕む混沌文字の発生源を探る。'],
          ['影獣の巣', 'ELITE', '闇竜に従う影獣の群れを退ける。'],
          ['混沌の咆哮', 'VANGUARD', '竜の咆哮が生む空間歪曲を突破する。'],
          ['闇竜ヴォルカリオン', 'MAIN BOSS', '混沌核を断ち、魔森の意味を取り戻す。'],
        ],
      }),
    ],
  },
  {
    id: 'chapter-02',
    no: 'II',
    title: '生命の守護と戦炎',
    subtitle: '聖樹の息吹と戦争の炎、その両方に宿る言葉を救う。',
    color: '#e36a45',
    king: {
      id: 'king-02',
      kind: 'king',
      title: '戦炎の王エアポカリオン',
      label: 'SOVEREIGN OF WAR',
      description: '生命を武力で統べようとする、炎と戦争の王。',
      battleStageId: 4,
      recommended: 16,
    },
    stages: [
      stage({
        id: 3,
        name: '聖樹の大地',
        label: 'LAND OF THE SACRED TREE',
        element: '風・自然',
        color: '#78bd67',
        boss: '翠風の守護者セレスティア',
        companion: 'グレン',
        recommended: 9,
        quests: [
          ['聖樹の門', 'ARRIVAL', '風の文字門を通り、聖樹領域へ入る。'],
          ['風の回廊', 'SEARCH', '浮遊島を結ぶ風脈を再接続する。'],
          ['守護兵の誓い', 'ELITE', '使命に縛られた守護兵を解放する。'],
          ['天蓋の試練', 'VANGUARD', '聖樹の天蓋に刻まれた試練を越える。'],
          ['守護者セレスティア', 'MAIN BOSS', '守護者の誤った命令文を修復する。'],
        ],
      }),
      stage({
        id: 4,
        name: '灼熱の火山国',
        label: 'VOLCANIC KINGDOM',
        element: '炎・獣',
        color: '#ff6b45',
        boss: '紅蓮の炎獣アグニロス',
        companion: 'フィオナ',
        recommended: 13,
        quests: [
          ['焼けた国境', 'ARRIVAL', '灰に埋もれた国境文を復元する。'],
          ['溶岩の文脈', 'SEARCH', '溶岩河に流れる戦争命令を止める。'],
          ['戦獣の群れ', 'ELITE', '炎獣の眷属が守る城塞を突破する。'],
          ['火口城塞', 'VANGUARD', '火口へ続く黒鉄の城門を解放する。'],
          ['炎獣アグニロス', 'MAIN BOSS', '紅蓮核を砕き、戦火の連鎖を断つ。'],
        ],
      }),
    ],
  },
  {
    id: 'chapter-03',
    no: 'III',
    title: '凍結した記憶と死の天蓋',
    subtitle: '氷海に眠る魂を解き、天空の終端から死の王へ至る。',
    color: '#59b9e8',
    king: {
      id: 'king-03',
      kind: 'king',
      title: '死魂の王ネクロス',
      label: 'SOVEREIGN OF DEATH',
      description: '魂と終焉を一つの文章へ閉じ込める、冥界の王。',
      battleStageId: 6,
      recommended: 26,
    },
    stages: [
      stage({
        id: 5,
        name: '凍結の氷海',
        label: 'FROZEN MEMORY SEA',
        element: '氷・水',
        color: '#6bbdf5',
        boss: '氷晶の支配者フロストノヴァ',
        companion: 'セレスト',
        recommended: 17,
        quests: [
          ['氷海の残響', 'ARRIVAL', '氷床の下に沈んだ声へ接続する。'],
          ['凍結した魂', 'SEARCH', '停止した魂の文章を一つずつ解凍する。'],
          ['氷晶牢獄', 'ELITE', '記憶を封じる氷晶の番人を退ける。'],
          ['女王の玉座', 'VANGUARD', '氷宮の最深部へ続く回廊を開く。'],
          ['フロストノヴァ', 'MAIN BOSS', '絶対零度の支配文を打ち破る。'],
        ],
      }),
      stage({
        id: 6,
        name: '浮遊する天空城',
        label: 'CITADEL ABOVE THE CLOUDS',
        element: '雷・天空',
        color: '#d7bd68',
        boss: '雷天の魔導皇ライディンガルド',
        companion: 'センリン',
        recommended: 21,
        quests: [
          ['第一試練「静」', 'TRIAL', '乱れない一打で、天空城への門を開く。'],
          ['第二試練「流」', 'TRIAL', '速度と連続入力で、流転する文字橋を渡る。'],
          ['第三試練「識」', 'TRIAL', '苦手文字を見抜き、知の結界を解く。'],
          ['天空城中枢', 'VANGUARD', '三試練を束ね、魔導皇の間へ進む。'],
          ['ライディンガルド', 'MAIN BOSS', '雷天の王権核を破壊し、センリンを解放する。'],
        ],
      }),
    ],
  },
];

export const GOD_CHALLENGE = {
  id: 'god-01',
  kind: 'god',
  title: '文字創世神アルファ・オリジン',
  label: 'DIVINE CHALLENGE',
  description: '三人の王を越えた者だけが到達する、創造と起源の神域。',
  battleStageId: 6,
  recommended: 30,
};

export const CAMPAIGN_STAGES = CAMPAIGN_CHAPTERS.flatMap((chapter) =>
  chapter.stages.map((item) => ({ ...item, chapterId: chapter.id })),
);

export const CAMPAIGN_QUESTS = CAMPAIGN_STAGES.flatMap((item) =>
  item.quests.map((entry) => ({ ...entry, stage: item, chapterId: item.chapterId })),
);

export const CAMPAIGN_NODES = CAMPAIGN_CHAPTERS.flatMap((chapter) => [
  ...chapter.stages.flatMap((item) => item.quests.map((entry) => ({ ...entry, stage: item, chapterId: chapter.id }))),
  { ...chapter.king, chapterId: chapter.id },
]).concat(GOD_CHALLENGE);

const nodeIndex = new Map(CAMPAIGN_NODES.map((item, index) => [item.id, index]));
const REQUIRED_COMPANIONS = ['nox', 'lilia', 'glen', 'fiona', 'celeste', 'senrin'];

export function ensureCampaign(profile) {
  profile.rpg ??= {};
  profile.rpg.campaign ??= {};
  const campaign = profile.rpg.campaign;
  campaign.version = 5;
  campaign.questCleared = campaign.questCleared && typeof campaign.questCleared === 'object' ? campaign.questCleared : {};
  campaign.kings = Array.isArray(campaign.kings) ? [...new Set(campaign.kings.filter((id) => /^king-0[1-3]$/.test(id)))] : [];
  campaign.godCleared = Boolean(campaign.godCleared);
  campaign.startedAt = Number(campaign.startedAt) || Date.now();
  return campaign;
}

export function campaignNodeById(id) {
  return CAMPAIGN_NODES.find((item) => item.id === id) || null;
}

export function campaignStageById(id) {
  const numeric = typeof id === 'number' ? id : Number(String(id).replace('stage-', ''));
  return CAMPAIGN_STAGES.find((item) => item.numericId === numeric) || null;
}

export function campaignNodeComplete(profile, id) {
  const campaign = ensureCampaign(profile);
  const node = campaignNodeById(id);
  if (!node) return false;
  if (node.kind === 'quest') return Boolean(campaign.questCleared[id]);
  if (node.kind === 'king') return campaign.kings.includes(id);
  return node.kind === 'god' ? campaign.godCleared : false;
}

export function campaignNodeIsUnlocked(profile, id) {
  const index = nodeIndex.get(id);
  if (index === undefined) return false;
  if (index === 0) return true;
  const previousComplete = campaignNodeComplete(profile, CAMPAIGN_NODES[index - 1].id);
  if (!previousComplete) return false;
  if (id === GOD_CHALLENGE.id) {
    const rescued = new Set(profile.rpg?.companions?.rescued || []);
    return REQUIRED_COMPANIONS.every((companionId) => rescued.has(companionId));
  }
  return true;
}

export function campaignNodeStatus(profile, id) {
  if (campaignNodeComplete(profile, id)) return 'complete';
  if (campaignNodeIsUnlocked(profile, id)) return 'available';
  return 'locked';
}

export function campaignChapterIsUnlocked(profile, chapterId) {
  const chapter = CAMPAIGN_CHAPTERS.find((item) => item.id === chapterId);
  const first = chapter?.stages[0]?.quests[0];
  return Boolean(first && campaignNodeIsUnlocked(profile, first.id));
}

export function campaignStageProgress(profile, stageId) {
  const item = campaignStageById(stageId);
  const cleared = item ? item.quests.filter((entry) => campaignNodeComplete(profile, entry.id)).length : 0;
  return { cleared, total: item?.quests.length || 0, complete: Boolean(item && cleared === item.quests.length) };
}

export function campaignProgress(profile) {
  const campaign = ensureCampaign(profile);
  const quests = CAMPAIGN_QUESTS.filter((item) => campaign.questCleared[item.id]).length;
  const kings = campaign.kings.length;
  const completed = quests + kings + (campaign.godCleared ? 1 : 0);
  return {
    quests,
    questTotal: CAMPAIGN_QUESTS.length,
    kings,
    kingTotal: 3,
    godCleared: campaign.godCleared,
    completed,
    total: CAMPAIGN_NODES.length,
    rate: Math.round(completed / CAMPAIGN_NODES.length * 100),
  };
}

export function activeCampaignChapter(profile) {
  const available = CAMPAIGN_CHAPTERS.filter((chapter) => campaignChapterIsUnlocked(profile, chapter.id));
  const incomplete = available.find((chapter) => !campaignNodeComplete(profile, chapter.king.id));
  return incomplete?.id || available.at(-1)?.id || CAMPAIGN_CHAPTERS[0].id;
}

export function completeCampaignNode(profile, id, stars = 1) {
  const campaign = ensureCampaign(profile);
  const node = campaignNodeById(id);
  if (!node) return { completed: false, node: null, next: null };
  if (node.kind === 'quest') {
    const previous = campaign.questCleared[id]?.stars || 0;
    campaign.questCleared[id] = {
      stars: Math.max(previous, Math.max(1, Math.min(3, Math.round(stars) || 1))),
      clearedAt: Date.now(),
    };
  } else if (node.kind === 'king') {
    if (!campaign.kings.includes(id)) campaign.kings.push(id);
  } else if (node.kind === 'god') {
    campaign.godCleared = true;
  }
  const index = nodeIndex.get(id);
  return {
    completed: true,
    node,
    next: index < CAMPAIGN_NODES.length - 1 ? CAMPAIGN_NODES[index + 1] : null,
  };
}
