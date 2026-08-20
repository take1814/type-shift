// TYPE SHIFT v5.0 敵キャラクター台帳。
// 敵ラフデザイン集の「雑魚20・小ボス10・中ボス10・属性違い20・特殊20」を
// すべてゲーム内IDへ変換し、6大ボス・三王・創世神を加えた。
import { enemyAssetRecord, enemyPresentationRecord } from './enemy-art.js?v=enemy-art-batch-v50';

const COLORS = {
  shadow: '#9b62ff',
  flame: '#ff624d',
  light: '#e8d48d',
  nature: '#76d06d',
  ice: '#6bc8ff',
  thunder: '#d9b968',
  machine: '#6a9dff',
  void: '#b365ff',
  earth: '#c99a58',
  wind: '#72d7b0',
  metal: '#b9c3d1',
  poison: '#85ca57',
};

const TRAITS = {
  none: '特性なし',
  quick: '速攻：攻撃間隔が短い',
  shell: '硬殻：HPが高い',
  chain: '連鎖：撃破後に分身が出現',
  disrupt: '乱れ：ミス時の攻撃ゲージ増加',
  rage: '怒り：HP30%以下で攻撃加速',
  mirror: '反射：会心攻撃を無効化',
  leech: '吸収：攻撃時にHPを回復',
  shield: '結界：最初の単語まで被害軽減',
  sovereign: '王威：結界と瀕死時攻撃加速',
};

const ELEMENT_NAMES = {
  shadow: '影', flame: '炎', light: '光', nature: '翠', ice: '氷', thunder: '雷',
  machine: '機構', void: '虚無', earth: '大地', wind: '風', metal: '鋼', poison: '毒',
};

const DROP_TIERS = {
  mob: { rarity: 'N', chance: .38, category: '文字片', suffix: '文字片' },
  elite: { rarity: 'R', chance: .56, category: '精製核', suffix: '精製核' },
  mid: { rarity: 'SR', chance: .72, category: '記憶核', suffix: '記憶核' },
  boss: { rarity: 'SSR', chance: 1, category: '固有遺物', suffix: '王印核' },
};

const MAJOR_DROPS = {
  bossGaius: 'ガイアスの虚無歯車',
  bossVolcarion: 'ヴォルカリオンの混沌竜鱗',
  bossCelestia: 'セレスティアの翠風冠',
  bossAgniros: 'アグニロスの紅蓮心臓',
  bossFrostnova: 'フロストノヴァの永久氷晶',
  bossRaidingald: 'ライディンガルドの雷天環',
  kingChronos: 'クロノスの時序王印',
  kingAerpocalion: 'エアポカリオンの戦炎王印',
  kingNecros: 'ネクロスの死魂王印',
  alphaOrigin: 'アルファ・オリジンの創世文字',
};

function createEnemyDrop(id, name, tier, element) {
  const meta = DROP_TIERS[tier] || DROP_TIERS.mob;
  const elementName = ELEMENT_NAMES[element] || '無名';
  return {
    id: `relic-${id}`,
    enemyId: id,
    name: MAJOR_DROPS[id] || `${name}の${elementName}${meta.suffix}`,
    rarity: meta.rarity,
    category: meta.category,
    chance: meta.chance,
    description: tier === 'boss'
      ? `${name}の存在情報が凝縮した唯一級の遺物。`
      : `${name}から回収される${elementName}属性の${meta.category}。`,
  };
}

function enemy(id, name, tier, element, artKey, options = {}) {
  return {
    id,
    name,
    tier,
    element,
    artKey,
    family: options.family || '通常種',
    hpMult: options.hpMult ?? 1,
    atkMult: options.atkMult ?? 1,
    intervalMult: options.intervalMult ?? 1,
    trait: options.trait || 'none',
    traitText: options.traitText || TRAITS[options.trait || 'none'],
    color: options.color || COLORS[element] || '#8b5cff',
    artHue: options.artHue || 0,
    artMark: options.artMark || '',
    drop: options.drop || createEnemyDrop(id, name, tier, element),
  };
}

const mobs = [
  enemy('runeSlime', 'ルーンスライム', 'mob', 'shadow', 'glitch', { family: '雑魚', artMark: 'M01' }),
  enemy('runeCrystal', 'ルーンクライル', 'mob', 'machine', 'glitch', { family: '雑魚', trait: 'shell', artHue: 20, artMark: 'M02' }),
  enemy('shadowBat', 'シャドウバット', 'mob', 'shadow', 'wisp', { family: '雑魚', trait: 'quick', artHue: 75, artMark: 'M03' }),
  enemy('glitchSpider', 'グリッチスパイダー', 'mob', 'machine', 'wordeater', { family: '雑魚', trait: 'disrupt', artHue: 24, artMark: 'M04' }),
  enemy('noiseImp', 'ノイズインプ', 'mob', 'void', 'twins', { family: '雑魚', trait: 'disrupt', artHue: 42, artMark: 'M05' }),
  enemy('runeGolem', 'ルーンゴーレム', 'mob', 'earth', 'shell', { family: '雑魚', trait: 'shell', hpMult: 1.25, artHue: -22, artMark: 'M06' }),
  enemy('voidScorpion', 'ヴォイドシオン', 'mob', 'void', 'wordeater', { family: '雑魚', atkMult: 1.12, artHue: 35, artMark: 'M07' }),
  enemy('skeletonSoldier', 'スケルトン兵', 'mob', 'shadow', 'guardian', { family: '雑魚', artHue: 18, artMark: 'M08' }),
  enemy('shadowWolf', 'シャードウルフ', 'mob', 'shadow', 'wordeater', { family: '雑魚', trait: 'quick', artHue: 55, artMark: 'M09' }),
  enemy('darkSlime', 'ダークスライム', 'mob', 'shadow', 'glitch', { family: '雑魚', hpMult: 1.08, artHue: 62, artMark: 'M10' }),
  enemy('troll', 'トロール', 'mob', 'earth', 'shell', { family: '雑魚', hpMult: 1.2, atkMult: 1.08, artHue: -18, artMark: 'M11' }),
  enemy('stoneTroll', 'ストーントロール', 'mob', 'metal', 'shell', { family: '雑魚', trait: 'shell', hpMult: 1.38, artHue: 8, artMark: 'M12' }),
  enemy('goblinWarrior', 'ゴブリンウォリア', 'mob', 'nature', 'guardian', { family: '雑魚', atkMult: 1.08, artHue: -48, artMark: 'M13' }),
  enemy('goblinArcher', 'ゴブリンアーチャー', 'mob', 'wind', 'guardian', { family: '雑魚', trait: 'quick', artHue: -72, artMark: 'M14' }),
  enemy('goblinShaman', 'ゴブリンシャーマン', 'mob', 'nature', 'guardian', { family: '雑魚', trait: 'disrupt', artHue: -42, artMark: 'M15' }),
  enemy('glitchGolem', 'グリッチゴーレム', 'mob', 'machine', 'shell', { family: '雑魚', trait: 'shell', artHue: 28, artMark: 'M16' }),
  enemy('darkWolf', 'ダスクウルフ', 'mob', 'shadow', 'wordeater', { family: '雑魚', trait: 'quick', artHue: 65, artMark: 'M17' }),
  enemy('runeMage', 'ルーンメイジ', 'mob', 'machine', 'guardian', { family: '雑魚', trait: 'disrupt', artHue: 12, artMark: 'M18' }),
  enemy('noiseSlime', 'ノイズスライム', 'mob', 'void', 'noise', { family: '雑魚', trait: 'disrupt', artHue: 58, artMark: 'M19' }),
  enemy('shadowImp', 'シャドーインプ', 'mob', 'shadow', 'twins', { family: '雑魚', trait: 'quick', artHue: 70, artMark: 'M20' }),
];

const elites = [
  enemy('armoredTroll', 'アーマードトロール', 'elite', 'metal', 'shell', { family: '小ボス', trait: 'shell', hpMult: 1.25, artMark: 'E01' }),
  enemy('bloodOgre', 'ブラッドオーガ', 'elite', 'flame', 'shell', { family: '小ボス', trait: 'rage', atkMult: 1.2, artHue: -85, artMark: 'E02' }),
  enemy('darkMage', 'ダークメイジ', 'elite', 'shadow', 'guardian', { family: '小ボス', trait: 'disrupt', artHue: 52, artMark: 'E03' }),
  enemy('voidKnight', 'ヴォイドナイト', 'elite', 'void', 'guardian', { family: '小ボス', trait: 'shield', artHue: 68, artMark: 'E04' }),
  enemy('glitchMimic', 'グリッチミミック', 'elite', 'machine', 'shell', { family: '小ボス', trait: 'chain', artHue: 20, artMark: 'E05' }),
  enemy('runeHunter', 'ルーンハンター', 'elite', 'machine', 'guardian', { family: '小ボス', trait: 'quick', artHue: 12, artMark: 'E06' }),
  enemy('indexBlade', 'インデクスブレード', 'elite', 'shadow', 'guardian', { family: '小ボス', trait: 'mirror', artHue: 45, artMark: 'E07' }),
  enemy('corruptGuardian', 'コラプトガーディアン', 'elite', 'nature', 'guardian', { family: '小ボス', trait: 'shield', artHue: -48, artMark: 'E08' }),
  enemy('hellStalker', 'ヘルストーカー', 'elite', 'flame', 'wordeater', { family: '小ボス', trait: 'quick', artHue: -80, artMark: 'E09' }),
  enemy('voidDrake', 'ヴォイドドレイク', 'elite', 'void', 'wordeater', { family: '小ボス', trait: 'rage', hpMult: 1.18, artHue: 60, artMark: 'E10' }),
];

const mids = [
  enemy('cyclops', 'サイクロプス', 'mid', 'earth', 'shell', { family: '中ボス', trait: 'rage', hpMult: 1.15, artHue: -18, artMark: 'B01' }),
  enemy('abyssSpirit', 'アビススピリット', 'mid', 'ice', 'wisp', { family: '中ボス', trait: 'quick', artHue: 0, artMark: 'B02' }),
  enemy('deathKnight', 'デスナイト', 'mid', 'shadow', 'guardian', { family: '中ボス', trait: 'shield', artHue: 52, artMark: 'B03' }),
  enemy('runeElemental', 'ルーンエレメンタル', 'mid', 'machine', 'wordeater', { family: '中ボス', trait: 'disrupt', artHue: 20, artMark: 'B04' }),
  enemy('cursePriest', 'カースプリースト', 'mid', 'void', 'guardian', { family: '中ボス', trait: 'leech', artHue: 68, artMark: 'B05' }),
  enemy('voidReaper', 'ヴォイドリーパー', 'mid', 'void', 'wordeater', { family: '中ボス', trait: 'quick', artHue: 56, artMark: 'B06' }),
  enemy('bloodGolem', 'ブラッドゴーレム', 'mid', 'flame', 'shell', { family: '中ボス', trait: 'rage', hpMult: 1.24, artHue: -85, artMark: 'B07' }),
  enemy('youngDarkDragon', 'ダークドラゴン幼体', 'mid', 'shadow', 'wordeater', { family: '中ボス', trait: 'rage', artHue: 60, artMark: 'B08' }),
  enemy('shadowChimera', 'シャドウキマイラ', 'mid', 'shadow', 'wordeater', { family: '中ボス', trait: 'chain', artHue: 72, artMark: 'B09' }),
  enemy('glitchMaiden', 'グリッチメイデン', 'mid', 'machine', 'guardian', { family: '中ボス', trait: 'mirror', artHue: 25, artMark: 'B10' }),
];

const variations = [
  ['flameSlime', 'フレイムスライム', 'flame', 'glitch', -85, 'A01'],
  ['iceSlime', 'アイススライム', 'ice', 'glitch', 0, 'A02'],
  ['stormSlime', 'ストームスライム', 'thunder', 'glitch', -25, 'A03'],
  ['earthSlime', 'アーススライム', 'earth', 'glitch', -40, 'A04'],
  ['shadowSlime', 'シャドウスライム', 'shadow', 'glitch', 62, 'A05'],
  ['lightSlime', 'ライトスライム', 'light', 'glitch', -10, 'A06'],
  ['voidSlime', 'ヴォイドスライム', 'void', 'glitch', 68, 'A07'],
  ['plasmaSlime', 'プラズマスライム', 'thunder', 'glitch', 30, 'A08'],
  ['metalSlime', 'メタルスライム', 'metal', 'glitch', 8, 'A09'],
  ['woodSlime', 'ウッドスライム', 'nature', 'glitch', -52, 'A10'],
  ['skeletonMage', 'スケルトンメイジ', 'shadow', 'guardian', 40, 'A11'],
  ['ghost', 'ゴースト', 'ice', 'wisp', 0, 'A12'],
  ['fireImp', '炎のインプ', 'flame', 'twins', -85, 'A13'],
  ['iceImp', '氷のインプ', 'ice', 'twins', 0, 'A14'],
  ['thunderImp', '雷のインプ', 'thunder', 'twins', -20, 'A15'],
  ['windImp', '風のインプ', 'wind', 'twins', -50, 'A16'],
  ['earthImp', '土のインプ', 'earth', 'twins', -35, 'A17'],
  ['lightImp', '光のインプ', 'light', 'twins', -10, 'A18'],
  ['darkImp', '闇のインプ', 'shadow', 'twins', 65, 'A19'],
  ['machineDrone', '機械兵ドローン', 'machine', 'guardian', 18, 'A20'],
].map(([id, name, element, artKey, artHue, artMark]) =>
  enemy(id, name, 'mob', element, artKey, { family: '属性変異', artHue, artMark, trait: id.includes('Slime') ? 'shell' : id.includes('Imp') ? 'quick' : 'none' }),
);

const specials = [
  enemy('poisonSlime', 'ポイズンスライム', 'mob', 'poison', 'glitch', { family: '特殊種', trait: 'leech', artHue: -55, artMark: 'S01' }),
  enemy('blindBat', 'ブラインドバット', 'mob', 'shadow', 'wisp', { family: '特殊種', trait: 'disrupt', artHue: 70, artMark: 'S02' }),
  enemy('sandWorm', 'サンドワーム', 'elite', 'earth', 'wordeater', { family: '特殊種', trait: 'shell', artHue: -30, artMark: 'S03' }),
  enemy('spikeBall', 'トゲトゲボール', 'mob', 'metal', 'shell', { family: '特殊種', trait: 'shell', artHue: 6, artMark: 'S04' }),
  enemy('bloodLeech', 'ブラッドリーチ', 'mob', 'flame', 'leech', { family: '特殊種', trait: 'leech', artHue: -82, artMark: 'S05' }),
  enemy('cultist', 'カルト信者', 'elite', 'shadow', 'guardian', { family: '特殊種', trait: 'disrupt', artHue: 48, artMark: 'S06' }),
  enemy('berserker', '狂信者', 'elite', 'flame', 'guardian', { family: '特殊種', trait: 'rage', artHue: -82, artMark: 'S07' }),
  enemy('cursedSwordsman', '呪われた剣士', 'elite', 'void', 'guardian', { family: '特殊種', trait: 'mirror', artHue: 66, artMark: 'S08' }),
  enemy('cursedKnight', '呪われた騎士', 'elite', 'shadow', 'guardian', { family: '特殊種', trait: 'shield', artHue: 55, artMark: 'S09' }),
  enemy('rustedSpearman', '錆びた槍兵', 'mob', 'metal', 'guardian', { family: '特殊種', artHue: -15, artMark: 'S10' }),
  enemy('darkFairy', 'ダークフェアリー', 'mob', 'shadow', 'wisp', { family: '特殊種', trait: 'quick', artHue: 70, artMark: 'S11' }),
  enemy('crystalWorm', 'クリスタルワーム', 'elite', 'ice', 'wordeater', { family: '特殊種', trait: 'shell', artMark: 'S12' }),
  enemy('skeletonArcher', 'スケルトンアーチャー', 'mob', 'shadow', 'guardian', { family: '特殊種', trait: 'quick', artHue: 38, artMark: 'S13' }),
  enemy('goblinBombardier', 'ゴブリン爆弾兵', 'mob', 'flame', 'guardian', { family: '特殊種', trait: 'chain', artHue: -74, artMark: 'S14' }),
  enemy('noiseFallen', 'ノイズフォールン', 'elite', 'machine', 'shell', { family: '特殊種', trait: 'disrupt', artHue: 20, artMark: 'S15' }),
  enemy('voidHound', 'ヴォイドハウンド', 'elite', 'void', 'wordeater', { family: '特殊種', trait: 'quick', artHue: 60, artMark: 'S16' }),
  enemy('runeGuardian', 'ルーンガーディアン', 'elite', 'machine', 'guardian', { family: '特殊種', trait: 'shield', artHue: 18, artMark: 'S17' }),
  enemy('shadowAssassin', 'シャドウアサシン', 'elite', 'shadow', 'guardian', { family: '特殊種', trait: 'quick', artHue: 62, artMark: 'S18' }),
  enemy('sisterWorm', 'シスターワーム', 'elite', 'void', 'wordeater', { family: '特殊種', trait: 'chain', artHue: 72, artMark: 'S19' }),
  enemy('glitchSpark', 'グリッチスパーク', 'mob', 'thunder', 'glitch', { family: '特殊種', trait: 'disrupt', artHue: 25, artMark: 'S20' }),
];

const bosses = [
  enemy('bossGaius', '虚無の機械神ガイアス', 'boss', 'machine', 'bossGaius', { family: '大ボス', trait: 'shield', hpMult: 1.28, atkMult: 1.12, artMark: 'I' }),
  enemy('bossVolcarion', '混沌の闇竜ヴォルカリオン', 'boss', 'shadow', 'bossVolcarion', { family: '大ボス', trait: 'rage', hpMult: 1.35, atkMult: 1.18, intervalMult: .92, artMark: 'II' }),
  enemy('bossCelestia', '翠風の守護者セレスティア', 'boss', 'nature', 'bossCelestia', { family: '大ボス', trait: 'leech', hpMult: 1.42, atkMult: 1.12, artMark: 'III' }),
  enemy('bossAgniros', '紅蓮の炎獣アグニロス', 'boss', 'flame', 'bossAgniros', { family: '大ボス', trait: 'rage', hpMult: 1.5, atkMult: 1.24, intervalMult: .9, artMark: 'IV' }),
  enemy('bossFrostnova', '氷晶の支配者フロストノヴァ', 'boss', 'ice', 'bossFrostnova', { family: '大ボス', trait: 'mirror', hpMult: 1.58, atkMult: 1.2, artMark: 'V' }),
  enemy('bossRaidingald', '雷天の魔導皇ライディンガルド', 'boss', 'thunder', 'bossRaidingald', { family: '大ボス', trait: 'sovereign', hpMult: 1.68, atkMult: 1.28, intervalMult: .86, artMark: 'VI' }),
  enemy('kingChronos', '叡智の王クロノス', 'boss', 'machine', 'kingChronos', { family: '王', trait: 'sovereign', hpMult: 1.82, atkMult: 1.3, artMark: 'K1' }),
  enemy('kingAerpocalion', '戦炎の王エアポカリオン', 'boss', 'flame', 'kingAerpocalion', { family: '王', trait: 'sovereign', hpMult: 2, atkMult: 1.38, artMark: 'K2' }),
  enemy('kingNecros', '死魂の王ネクロス', 'boss', 'shadow', 'kingNecros', { family: '王', trait: 'sovereign', hpMult: 2.2, atkMult: 1.45, artMark: 'K3' }),
  enemy('alphaOrigin', '文字創世神アルファ・オリジン', 'boss', 'light', 'alphaOrigin', { family: '神', trait: 'sovereign', hpMult: 2.7, atkMult: 1.55, intervalMult: .78, artMark: 'α' }),
];

export const ENEMIES = Object.fromEntries(
  [...mobs, ...elites, ...mids, ...variations, ...specials, ...bosses].map((item) => [item.id, item]),
);

// 旧実装の短縮キーを後方互換で残しつつ、仕様書の標準キーを公開する。
// stageId / stageIds はステージ定義（battle.js）がプール確定後に補完する。
Object.values(ENEMIES).forEach((item) => {
  item.elements = [item.element];
  item.hpMultiplier = item.hpMult;
  item.attackMultiplier = item.atkMult;
  item.abilities = item.trait === 'none' ? [] : [item.trait];
  item.stageId = null;
  item.stageIds = [];
  item.art = enemyAssetRecord(item.id, item);
  item.presentation = enemyPresentationRecord(item.id, item);
});

export const ENEMY_TOTALS = {
  mob: mobs.length,
  elite: elites.length,
  mid: mids.length,
  variation: variations.length,
  special: specials.length,
  major: bosses.length,
};

export function rollEnemyDrop(enemyData, random = Math.random) {
  if (!enemyData?.drop) return null;
  const roll = Math.min(1, Math.max(0, Number(random()) || 0));
  return roll <= enemyData.drop.chance ? { ...enemyData.drop, count: 1 } : null;
}
