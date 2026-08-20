import { loadProfile, saveProfile, validateProfile } from './core/storage.js?v=enemy-art-batch-v50';
import { AudioDirector } from './core/audio.js?v=boss-finish-v53';
import { CHAR_ORDER, KEYBOARD_ROWS, SHIFT_BASE, checkUnlock, getCharStats, mastery, unlockedChars, weakestChars } from './engine/chars.js?v=enemy-art-batch-v50';
import { TypingSession } from './engine/typing.js?v=difficulty-v51';
import { Battle, ENEMIES, STAGES } from './rpg/battle.js?v=difficulty-v51';
import { CAMPAIGN_CHAPTERS, GOD_CHALLENGE, activeCampaignChapter, campaignChapterIsUnlocked, campaignNodeById, campaignNodeComplete, campaignNodeIsUnlocked, campaignNodeStatus, campaignProgress, campaignStageProgress, completeCampaignNode, ensureCampaign } from './rpg/campaign.js?v=enemy-art-batch-v50';
import { COMPANIONS, applyCompanionBattleBond, companionBondProgress, companionById, companionPortrait, companionUnlockProgress, ensureCompanions, evaluateRescueTrial, grantRescueForStage, isStagePlayable, rescuePreview, setCompanionParty, syncHistoricalRescues } from './rpg/companions.js?v=enemy-art-batch-v50';
import { enemyArt, enemyBattleStyle } from './rpg/enemy-art.js?v=enemy-art-batch-v50';
import { weaponArt } from './rpg/weapon-art.js?v=enemy-art-batch-v50';
import { stageDialogue } from './meta/dialogue.js?v=enemy-art-batch-v50';
import { ACHIEVEMENTS, TITLES, applySessionMeta, bondProgress, ensureDaily, ensureMetaProgression, equipTitle, getTitle, storyArchive } from './meta/progression.js?v=enemy-art-batch-v50';
import { SKILLS, WEAPONS, buyWeapon, combatStats, enhanceCost, enhanceWeapon, ensureRpg, equipWeapon, evolveWeapon, getWeapon, unlockSkill, weaponPlus } from './rpg/progression.js?v=enemy-art-batch-v50';

const app = document.querySelector('#app');
document.documentElement.dataset.appBoot = 'running';
let profile = loadProfile();
ensureMetaProgression(profile);
ensureCompanions(profile);
ensureCampaign(profile);
syncHistoricalRescues(profile);
saveProfile(profile);

const state = {
  route: location.hash.slice(1) || 'home',
  settings: { ...profile.settings, keyboard: profile.settings.showKb },
  session: null,
  lastResult: null,
  battle: null,
  timer: null,
  enemyTimer: null,
  analysisKey: null,
  codexTab: 'enemies',
  selectedStage: 1,
  selectedCampaignNode: null,
  campaignChapter: activeCampaignChapter(profile),
  attackFx: 'idle',
  attackFxCycle: 0,
  supportFxCycle: 0,
  attackResetTimer: null,
  lastDamage: 0,
  lastSupport: null,
  victory: null,
  defeat: false,
  finisher: null,
  finisherTimer: null,
  bossFinisher: null,
  bossFinisherTimer: null,
  battleIntro: null,
  battleIntroTimer: null,
  dialogue: null,
  storyEntry: null,
  online: navigator.onLine,
  saveNotice: null,
};

const FINAL_SHIFT_WORD = 'rewrite';
const ORIGIN_SHIFT_WORD = 'write the world';
const BOSS_FINISHER_PLAYBACK_RATE = 0.75;
const bossFinisherDelay = (milliseconds) => Math.round(milliseconds / BOSS_FINISHER_PLAYBACK_RATE);
const BATTLE_PLAYER_ART = {
  idle: 'assets/battle/player/ren-idle-cutout-v1.png',
  strike: 'assets/battle/player/ren-strike-cutout-v1.png',
};

const audio = new AudioDirector(() => state.settings);
const unlockAudio = () => audio.unlock();
document.addEventListener('pointerdown', unlockAudio, { passive: true });
document.addEventListener('keydown', unlockAudio);

const routes = [
  ['home', 'ホーム', '⌂'], ['quest', 'クエスト', '◇'], ['practice', '修練場', '⌁'], ['character', 'キャラクター', 'R'], ['party', '仲間', 'P'], ['armory', '育成', '↑'], ['stats', '分析', '⌁'], ['codex', '図鑑', '▣'], ['story', '物語', '✦'], ['settings', '設定', '⚙'],
];

const STAGE_ART = {
  1: { label: 'FALLEN ARCANE CAPITAL', motif: '崩壊魔都 / 虚無機械 / 兄弟の残響', color: '#667cff', background: 'assets/battle/stages/stage-01-bg-v1.png' },
  2: { label: 'CORRUPTED WITCHWOOD', motif: '侵食魔森 / 闇竜 / 混沌の根', color: '#38a98b', background: 'assets/battle/stages/stage-02-bg-v1.png' },
  3: { label: 'LAND OF THE SACRED TREE', motif: '聖樹 / 翠風 / 浮遊大地', color: '#78bd67', background: 'assets/battle/stages/stage-03-bg-v1.png' },
  4: { label: 'VOLCANIC KINGDOM', motif: '火山国 / 紅蓮 / 戦炎の城塞', color: '#ff6b45', background: 'assets/battle/stages/stage-04-bg-v1.png' },
  5: { label: 'FROZEN MEMORY SEA', motif: '氷海 / 凍結記憶 / 氷晶宮', color: '#6bbdf5', background: 'assets/battle/stages/stage-05-bg-v1.png' },
  6: { label: 'CITADEL ABOVE THE CLOUDS', motif: '天空城 / 雷天 / 静・流・識', color: '#d7bd68', background: 'assets/battle/stages/stage-06-bg-v1.png' },
  god: { label: 'CREATION SCRIPT REALM', motif: '創世文字界 / 起源 / 因果律', color: '#d8c27a', background: 'assets/battle/stages/god-origin-realm-bg-v1.png' },
};

const SPECIAL_ENEMY_LOCATIONS = {
  kingChronos: ['CHAPTER I · 叡智の王座'],
  kingAerpocalion: ['CHAPTER II · 戦炎の王座'],
  kingNecros: ['CHAPTER III · 死魂の王座'],
  alphaOrigin: ['神への挑戦 · 創世文字界'],
};

function enemyLocations(enemyId) {
  const locations = STAGES.filter((stage) => Object.values(stage.pool).some((ids) => ids.includes(enemyId)))
    .map((stage) => `STAGE ${String(stage.id).padStart(2, '0')} · ${stage.name}`);
  return [...locations, ...(SPECIAL_ENEMY_LOCATIONS[enemyId] || [])];
}

function stageEnvironment(stage, className = '') {
  const artKey = stage.artKey || stage.id;
  const art = STAGE_ART[artKey] || STAGE_ART[1];
  const stageClass = artKey === 'god' ? 'stage-god' : `stage-${stage.id}`;
  if (className.includes('battle-stage-art')) {
    return `<div class="stage-environment battle-stage-art ${stageClass}" style="--stage-color:${art.color}"><img src="${art.background}" alt="" decoding="async"><span class="battle-stage-atmosphere" aria-hidden="true"></span></div>`;
  }
  if (className.includes('campaign-god-art')) {
    return `<div class="stage-environment campaign-god-art ${stageClass}" style="--stage-color:${art.color}"><img src="${art.background}" alt="" loading="lazy" decoding="async"><span aria-hidden="true"></span></div>`;
  }
  return `<div class="stage-environment ${stageClass} ${className}" style="--stage-color:${art.color}"><i></i><i></i><i></i><span>${art.label}</span><small>${art.motif}</small></div>`;
}

const heroSvg = (compact = false) => `
<svg viewBox="0 0 520 620" role="img" aria-label="オリジナル主人公レンのシルエット">
  <defs><linearGradient id="coat" x1="0" x2="1"><stop stop-color="#05070b"/><stop offset=".54" stop-color="#17263a"/><stop offset="1" stop-color="#08101b"/></linearGradient><linearGradient id="blade" x1="0" x2="1"><stop stop-color="#dffaff"/><stop offset=".38" stop-color="#20c7ff"/><stop offset="1" stop-color="#3978ff"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <g opacity=".28" stroke="#20c7ff" fill="none"><circle cx="276" cy="263" r="175"/><circle cx="276" cy="263" r="132" stroke-dasharray="4 12"/><path d="M88 378h362M112 410h313"/></g>
  <path d="M251 73c-20 18-28 49-20 72l-19 32 79 9-6-51c15-25 6-55-34-62z" fill="#07101b" stroke="#3978ff" stroke-width="3"/>
  <path d="M220 123c8-42 44-70 86-44 14 9 12 37 1 60-28 14-55 10-87-16z" fill="#111b2a"/>
  <path d="M236 127c13-35 46-38 70-14-4-3-15-3-23 0 6 6 10 14 11 23-19-10-38-12-58-9z" fill="#05070b"/>
  <ellipse cx="274" cy="161" rx="35" ry="45" fill="#c4d1dc" opacity=".94"/>
  <path d="M241 151c17 5 39 3 64-10v-13c-27-23-57-13-69 16z" fill="#07101b"/><path d="M246 153c15-19 28-25 48-23" stroke="#3978ff" stroke-width="5" fill="none"/>
  <path d="M258 164h12m12 0h12" stroke="#20c7ff" stroke-width="3" filter="url(#glow)"/>
  <path d="M214 208l-49 39 26 42 35-22 25 107 78 8 27-115 40 25 25-43-55-40-35 18-38-7-39 7z" fill="url(#coat)" stroke="#283f59" stroke-width="3"/>
  <path d="M205 229l-30 22 22 30 28-18" fill="#101a28" stroke="#20c7ff" stroke-width="3"/><path d="M218 244l-18 101" stroke="#20c7ff" stroke-width="2" opacity=".72"/>
  <path d="M251 225l22 18 26-17 18 53-37 16-40-14z" fill="#1c2a3b" stroke="#3978ff" stroke-width="2"/>
  <path d="M225 287l-25 223 62 44 16-135 16 136 65-46-27-222-52 25z" fill="url(#coat)" stroke="#20344c" stroke-width="3"/>
  <path d="M234 303l43 111 40-110" fill="none" stroke="#20c7ff" stroke-width="2" opacity=".68"/><path d="M256 303c17 16 30 17 47 0" stroke="#d6b86a" stroke-width="3" fill="none"/>
  <path d="M195 302l-59 123 18 10 71-104" fill="#0b1018" stroke="#263e5c" stroke-width="3"/><path d="M359 299l46 115-18 12-56-100" fill="#101a28" stroke="#263e5c" stroke-width="3"/>
  <path d="M397 397l23 7-84 147-18-10z" fill="url(#blade)" filter="url(#glow)"/><path d="M385 414l43 13-9 15-45-14z" fill="#111b2a" stroke="#20c7ff" stroke-width="2"/>
  <path d="M143 432c-20 39-16 82 23 99" fill="none" stroke="#20c7ff" stroke-width="2" opacity=".72"/><text x="119" y="448" fill="#20c7ff" font-family="Orbitron" font-size="10" letter-spacing="4">TYPE · SHIFT</text>
</svg>`;

// Art Bible v1.0の正式デザイン。用途に合わせた構図だけを変え、人物造形は統一する。
const heroKeyArt = (className = '') => {
  const src = className === 'hero-keyart' ? 'assets/home-ren-aster-v2.png' : 'assets/ren-aster-keyart-v2.png';
  return `<img class="${className}" src="${src}" alt="シフター、レン・アスター。非対称の黒髪、開きブラケット型の左肩装甲、文字帯の分割コート、シフトブレードを備えた正式キーアート" decoding="async" />`;
};

function navButton([id, label, icon]) { return `<button class="nav-button ${state.route === id ? 'active' : ''}" data-route="${id}" aria-label="${label}"><span class="nav-icon">${icon}</span><span class="nav-label">${label}</span></button>`; }

function shiftRank(level) {
  if (level >= 30) return 'S';
  if (level >= 20) return 'A';
  if (level >= 10) return 'B';
  if (level >= 5) return 'C';
  return 'D';
}

function shell(content) {
  const rpg = ensureRpg(profile);
  const nextXp = rpg.level * 120;
  return `<span class="ambient a1"></span><span class="ambient a2"></span><span class="ambient a3"></span><div class="layout"><aside class="sidebar"><div class="brand"><span class="brand-mark"></span><span><span class="brand-name">TYPE SHIFT</span><span class="brand-sub">REWRITE REALITY</span></span></div><nav class="nav">${routes.map(navButton).join('')}</nav><div class="side-profile"><p class="profile-title">SHIFTER PROFILE</p><p class="profile-level">LV. ${String(rpg.level).padStart(2, '0')}</p><p class="profile-xp">XP ${rpg.xp} / ${nextXp}</p></div></aside><main class="main"><header class="topbar"><div class="breadcrumb">ARCHIVE / <b>${routes.find(([id]) => id === state.route)?.[1] || 'ホーム'}</b></div><div class="top-stats"><span class="connection-pill ${state.online ? 'online' : 'offline'}">${state.online ? 'ONLINE' : 'OFFLINE'}</span><span class="top-stat">GOLD<strong>${rpg.gold.toLocaleString()}</strong></span><span class="top-stat">SHIFT RANK<strong>${shiftRank(rpg.level)}</strong></span><span class="avatar-mini">R</span></div></header>${content}</main></div><nav class="mobile-nav">${routes.slice(0, 5).map(navButton).join('')}</nav><div class="toast" id="toast"></div>`;
}

function home() {
  const recent = profile.history.slice(0, 20);
  const currentWpm = recent[0]?.wpm || 0;
  const averageAccuracy = recent.length ? Math.round(recent.reduce((sum, item) => sum + item.acc, 0) / recent.length) : 100;
  const bestCombo = recent.length ? Math.max(...recent.map((item) => item.combo || 0)) : 0;
  const activeChars = unlockedChars(profile);
  const masteryRate = activeChars.length ? Math.round(activeChars.reduce((sum, char) => sum + mastery(profile, char), 0) / activeChars.length) : 0;
  const campaign = campaignProgress(profile);
  const questRate = campaign.rate;
  const memories = storyArchive(profile);
  const storyRate = Math.round(memories.filter((entry) => entry.seen).length / Math.max(1, memories.length) * 100);
  const focusKeys = weakestChars(profile, Math.min(8, activeChars.length));
  return `<section class="screen"><div class="eyebrow">ARCHIVE // 001</div><h1 class="screen-title">記憶の起点</h1><p class="screen-copy">失われた文字を取り戻し、世界の意味を再構築する。</p><div class="hero glass"><div class="hero-copy"><div class="eyebrow">NEXT MISSION</div><h2>六つの世界を<br><span>打ち直せ。</span></h2><p>崩壊した魔都から始まり、三人の王を越えて文字創世神へ至る。最初の一行を、正確な一打で取り戻そう。</p><div class="hero-actions"><button class="button primary" data-route="quest">物語を進める <span class="key">ENTER</span></button><button class="button secondary" data-route="character">シフターを確認</button></div></div><div class="hero-art"><span class="rune-ring"></span>${heroKeyArt('hero-keyart')}</div></div><div class="stat-grid"><article class="stat-card glass"><span class="label">現在のWPM</span><b class="value">${currentWpm}</b><span class="delta">直近の修練記録</span></article><article class="stat-card glass"><span class="label">平均正確率</span><b class="value">${averageAccuracy}<span style="font-size:13px">%</span></b><span class="delta">直近${recent.length}回</span></article><article class="stat-card glass"><span class="label">最高コンボ</span><b class="value">${bestCombo}</b><span class="delta">修練場の自己記録</span></article><article class="stat-card glass"><span class="label">物語進行</span><b class="value">${campaign.completed}<span style="font-size:13px">/${campaign.total}</span></b><span class="delta">クエスト・王・神域</span></article></div><div class="dashboard-grid"><article class="panel glass"><div class="panel-title"><h3>現在の修復記録</h3><span>ARCHIVE FLOW</span></div><div class="progress-row"><div class="progress-label"><span>タイピング習熟</span><strong>${masteryRate}%</strong></div><div class="bar"><i style="width:${masteryRate}%"></i></div></div><div class="progress-row"><div class="progress-label"><span>物語進行</span><strong>${questRate}%</strong></div><div class="bar"><i style="width:${questRate}%"></i></div></div><div class="progress-row"><div class="progress-label"><span>記憶の収集</span><strong>${storyRate}%</strong></div><div class="bar"><i style="width:${storyRate}%"></i></div></div></article><article class="panel glass"><div class="panel-title"><h3>今日の焦点キー</h3><span>ADAPTIVE</span></div><div class="key-grid">${focusKeys.map((char, index) => `<span class="key ${index < 3 ? 'weak' : ''}">${char.toUpperCase()}</span>`).join('')}</div><p class="screen-copy" style="margin-top:15px;font-size:11px">習熟度の低い ${focusKeys.slice(0, 3).map((char) => char.toUpperCase()).join(' / ') || '—'} を中心に、次の出題を自動調整します。</p></article></div></section>`;
}

function quest() {
  ensureCampaign(profile);
  const progress = campaignProgress(profile);
  const companionProgress = companionUnlockProgress(profile);
  const selected = CAMPAIGN_CHAPTERS.find((chapter) => chapter.id === state.campaignChapter) || CAMPAIGN_CHAPTERS[0];
  const chapterTabs = CAMPAIGN_CHAPTERS.map((chapter) => {
    const open = campaignChapterIsUnlocked(profile, chapter.id);
    const complete = campaignNodeComplete(profile, chapter.king.id);
    return `<button class="campaign-chapter-tab ${state.campaignChapter === chapter.id ? 'active' : ''} ${complete ? 'complete' : ''} ${open ? '' : 'locked'}" ${open ? `data-campaign-chapter="${chapter.id}"` : 'disabled'} style="--chapter:${chapter.color}"><span>CHAPTER ${chapter.no}</span><b>${chapter.title}</b><small>${complete ? '王を撃破' : open ? '攻略中' : 'LOCKED'}</small></button>`;
  }).join('');

  const stageCards = selected.stages.map((stage) => {
    const stageProgress = campaignStageProgress(profile, stage.numericId);
    const art = STAGE_ART[stage.numericId] || STAGE_ART[1];
    const nodes = stage.quests.map((entry) => {
      const status = campaignNodeStatus(profile, entry.id);
      const record = ensureCampaign(profile).questCleared[entry.id];
      const underLevel = profile.rpg.level < entry.recommended;
      const playable = status !== 'locked';
      return `<button class="campaign-quest-node ${status} ${underLevel && playable ? 'high-risk' : ''}" ${playable ? `data-campaign-node="${entry.id}"` : 'disabled'} aria-label="${entry.title} ${status === 'complete' ? 'クリア済み' : status === 'available' ? '挑戦可能' : '未解放'}"><i>${status === 'complete' ? '✓' : entry.questIndex}</i><span><small>${entry.type}</small><b>${entry.title}</b><em>LV.${entry.recommended}${record ? ` · ${'★'.repeat(record.stars)}` : ''}</em></span></button>`;
    }).join('');
    return `<article class="campaign-stage glass stage-${stage.numericId} ${stageProgress.complete ? 'complete' : ''}" style="--stage-color:${art.color}">
      ${stageEnvironment({ id: stage.numericId }, 'campaign-stage-art')}
      <header class="campaign-stage-head">
        <div><span>STAGE ${String(stage.numericId).padStart(2, '0')} · ${stage.label}</span><h2>${stage.name}</h2><p>${stage.element} / 推奨 LV.${stage.recommended}～</p></div>
        <div class="campaign-stage-progress"><b>${stageProgress.cleared}</b><span>/ 5 QUESTS</span></div>
      </header>
      <div class="campaign-stage-targets"><span>救出対象 <b>${stage.companion}</b></span><span>大ボス <b>${stage.boss}</b></span></div>
      <div class="campaign-quest-route">${nodes}</div>
    </article>`;
  }).join('');

  const kingStatus = campaignNodeStatus(profile, selected.king.id);
  const kingPlayable = kingStatus !== 'locked';
  const godStatus = campaignNodeStatus(profile, GOD_CHALLENGE.id);
  const godPlayable = godStatus !== 'locked';
  return `<section class="screen campaign-screen" style="--chapter:${selected.color}">
    <div class="campaign-title-row">
      <div><div class="eyebrow">STORY PATH</div><h1 class="screen-title">三章六界の修復路</h1><p class="screen-copy">章を選び、二つのステージを5クエストずつ攻略して、その世界を統べる王へ挑む。</p></div>
      <div class="campaign-total glass"><span>TOTAL RESTORATION</span><b>${progress.rate}%</b><small>${progress.quests}/30 QUESTS · ${progress.kings}/3 KINGS</small><div class="bar"><i style="width:${progress.rate}%"></i></div></div>
    </div>
    <nav class="campaign-chapter-tabs" aria-label="章選択">${chapterTabs}</nav>
    <header class="campaign-chapter-hero glass">
      <span>CHAPTER ${selected.no}</span><div><h2>${selected.title}</h2><p>${selected.subtitle}</p></div><b>${selected.stages.map((item) => `STAGE ${String(item.numericId).padStart(2, '0')}`).join(' · ')}</b>
    </header>
    <div class="campaign-stage-grid">${stageCards}</div>
    <article class="campaign-king glass ${kingStatus}" style="--chapter:${selected.color}">
      <div class="campaign-king-sigil"><i></i><span>王</span></div>
      <div><span>${selected.king.label}</span><h2>${selected.king.title}</h2><p>${selected.king.description}</p><small>${kingStatus === 'complete' ? 'SOVEREIGN DEFEATED' : kingStatus === 'available' ? '二つのステージを修復。王への道が開かれた。' : '二つのステージを完全修復すると解放'}</small></div>
      <button class="button ${kingPlayable ? 'primary' : ''}" ${kingPlayable ? `data-campaign-node="${selected.king.id}"` : 'disabled'}>${kingStatus === 'complete' ? '王へ再挑戦' : kingStatus === 'available' ? '王戦を開始' : 'SEALED'}</button>
    </article>
    <article class="campaign-god glass ${godStatus}">
      ${stageEnvironment({ id: 6, artKey: 'god' }, 'campaign-god-art')}
      <div><span>DIVINE CHALLENGE</span><h2>神への挑戦</h2><p>${GOD_CHALLENGE.title} — 三人の王を越えた先に、文字を生み出した起源が待つ。</p></div>
      <div class="campaign-god-lock"><b>${godStatus === 'complete' ? 'ORIGIN RESTORED' : godStatus === 'available' ? 'THE ORIGIN GATE IS OPEN' : `${progress.kings} / 3 KINGS · ${companionProgress.rescued} / 6 ALLIES`}</b><button class="button ${godPlayable ? 'primary' : ''}" ${godPlayable ? `data-campaign-node="${GOD_CHALLENGE.id}"` : 'disabled'}>${godStatus === 'complete' ? '神域へ再挑戦' : godStatus === 'available' ? '神域へ進む' : '神域は封印されている'}</button></div>
    </article>
  </section>`;
}

function character() {
  const rpg = ensureRpg(profile);
  const stats = combatStats(profile);
  const weapon = getWeapon(profile);
  const equippedWeaponPlus = weaponPlus(profile, weapon.id);
  const equippedTitle = getTitle(profile);
  const bond = bondProgress(profile);
  const ownedTitles = new Set(profile.meta.titles.owned);
  const rows = [
    ['攻撃力', Math.round(stats.atk), `${Math.min(100, Math.round(stats.atk / 1.6))}%`],
    ['最大HP', stats.maxHp, `${Math.min(100, Math.round(stats.maxHp / 5))}%`],
    ['会心率', `${Math.round(stats.effects.crit * 100)}%`, `${Math.round(stats.effects.crit * 100)}%`],
    ['Burst獲得', `${Math.round((1 + stats.effects.burst) * 100)}%`, `${Math.min(100, Math.round((1 + stats.effects.burst) * 50))}%`],
  ];
  return `<section class="screen"><div class="eyebrow">SHIFTER PROFILE</div><h1 class="screen-title">レン・アスター</h1><p class="screen-copy">文字を剣に変え、失われた意味を取り戻す若きシフター。</p><div class="character-layout"><article class="character-card glass"><div class="character-figure">${heroKeyArt('character-keyart')}</div><div class="character-name"><span class="eyebrow">${shiftRank(rpg.level)} RANK // LV.${String(rpg.level).padStart(2, '0')}</span><h2>REN ASTER</h2><p>THE ONE WHO SHIFTS</p></div></article><div><div class="equipment"><article class="equip-card weapon-equip-card glass">${weaponArt(weapon.id, weapon, { micro: true, plus: equippedWeaponPlus, equipped: true })}<div><span class="equip-type">WEAPON</span><h4>${weapon.name} +${equippedWeaponPlus}</h4><p>${weapon.rarity} / ${weapon.element.toUpperCase()}。入力を剣閃へ変換する装備。</p></div></article><article class="equip-card glass"><span class="equip-type">BURST</span><h4>ブレイブ・スラッシュ</h4><p>敵の現在HP25%と攻撃力に応じた一撃を放つ。</p></article><article class="equip-card glass"><span class="equip-type">TITLE</span><h4>${equippedTitle.name}</h4><p>${equippedTitle.effectText}。${equippedTitle.text}</p></article><article class="equip-card glass"><span class="equip-type">BOND</span><h4>アーカイブ・ヘイヴン Lv.${bond.level}</h4><p>戦闘補正を解放。次の絆レベルまで ${bond.level >= 10 ? 'MAX' : `${bond.points}/${bond.required}`}。</p></article></div><article class="panel glass equipment-stats"><div class="panel-title"><h3>シフターステータス</h3><span>DERIVED</span></div>${rows.map(([label, value, width])=>`<div class="stat-line"><span>${label}</span><div class="bar"><i style="width:${width}"></i></div><b>${value}</b></div>`).join('')}<p class="screen-copy" style="margin-top:16px;font-size:11px">修練場で記録したWPM・正確率・習熟度と、武器・スキル・称号・絆の成長が戦闘力へ反映されます。</p></article><article class="panel glass title-loadout"><div class="panel-title"><h3>称号装備</h3><span>${ownedTitles.size} / ${TITLES.length}</span></div><div class="title-grid">${TITLES.map((title) => `<button class="title-chip ${ownedTitles.has(title.id) ? 'owned' : 'locked'} ${equippedTitle.id === title.id ? 'equipped' : ''}" ${ownedTitles.has(title.id) ? `data-title="${title.id}"` : 'disabled'}><span>${ownedTitles.has(title.id) ? title.name : '未解放'}</span><small>${ownedTitles.has(title.id) ? title.effectText : '実績達成で解放'}</small></button>`).join('')}</div></article><article class="panel glass bond-panel"><div class="panel-title"><h3>絆レベル</h3><span>ARCHIVE HAVEN</span></div><div class="bond-level"><b>Lv.${bond.level}</b><span>累計 ${bond.total} PT</span></div><div class="bar"><i style="width:${bond.rate}%"></i></div><p class="screen-copy">毎日の起動と修練・クエスト完了で絆が上昇します。Lv.3 / 5 / 7 / 10で追加の戦闘効果を獲得します。</p></article></div></div></section>`;
}

function party() {
  const data = ensureCompanions(profile);
  const progress = companionUnlockProgress(profile);
  const rescued = new Set(data.rescued);
  const partySet = new Set(data.party);
  const cards = COMPANIONS.map((companion) => {
    const found = rescued.has(companion.id);
    const inParty = partySet.has(companion.id);
    const bond = companionBondProgress(profile, companion.id);
    const lockText = companion.id === 'senrin' ? 'ステージ6の「静・流・識」を越え、ライディンガルドを撃破して加入' : `ステージ${companion.unlockStage}の第5クエストをクリア`;
    const brother = companion.id === 'nox' ? '<span class="companion-brother">レンの弟</span>' : '';
    const provisional = companion.id === 'nox' && data.noxProvisional;
    return `<article class="companion-card glass ${found ? 'rescued' : 'locked'} ${inParty ? 'in-party' : ''}" style="--companion:${companion.color}">${companionPortrait(companion, { locked: !found })}<div class="companion-copy"><span>${found ? `${companion.role} / ${companion.weapon}` : '救出待ち'}</span><h3>${found ? companion.name : '未救出の同行者'}${brother}${provisional ? '<span class="companion-brother provisional">仮加入</span>' : ''}</h3><p>${found ? companion.story : lockText}</p><div class="companion-skill"><b>${found ? companion.supportName : 'LOCKED SUPPORT'}</b><small>${found ? companion.supportText : 'クエストを進めると支援技が解放されます。'}</small></div>${found ? `<div class="companion-bond-progress"><span>Bond ${bond.rank} / 5</span><div class="bar"><i style="width:${bond.rate}%"></i></div></div>` : ''}<div class="companion-meta"><span>${found ? `${bond.points} PT` : 'UNKNOWN'}</span><span>${companion.rare ? 'RARE' : `Stage ${companion.unlockStage}`}</span></div></div><button class="button ${inParty ? 'primary' : 'secondary'}" data-party="${companion.id}" ${found ? '' : 'disabled'}>${inParty ? '同行中' : found ? '同行させる' : '未救出'}</button></article>`;
  }).join('');
  const partyMembers = progress.party.length
    ? progress.party.map((item) => `<div class="party-slot filled" style="--companion:${item.color}">${companionPortrait(item, { compact: true })}<span><b>${item.name}</b><small>${item.supportName}</small></span></div>`).join('')
    : '<div class="party-slot empty">サブメンバー未編成</div>';
  const sibling = data.rescued.includes('nox')
    ? `<article class="panel glass sibling-panel ${data.noxProvisional ? 'provisional' : ''}"><div class="panel-title"><h3>アスター兄弟</h3><span>${data.noxProvisional ? 'PROVISIONAL' : `${data.siblingGauge} / 100`}</span></div><p class="screen-copy">${data.noxProvisional ? 'ノクスは仮加入中です。ノクスを同行させ、正確率94%以上・完全単語5個以上でクエストを完了すると兄弟編が進みます。' : 'レンが兄、ノクスが弟。ノーミス単語と会心で兄弟ゲージが上昇し、100%になると次の単語で「ASTER LIGATURE」が自動発動します。'}</p><div class="bar"><i style="width:${data.noxProvisional ? 0 : data.siblingGauge}%"></i></div></article>`
    : `<article class="panel glass sibling-panel locked"><div class="panel-title"><h3>アスター兄弟</h3><span>LOCKED</span></div><p class="screen-copy">ステージ1「崩壊した魔都」でノクスを救出すると、レンとの兄弟設定と専用ゲージが解放されます。</p></article>`;
  const trials = data.senrinTrials;
  const trialPanel = progress.rescued >= 5 ? `<article class="panel glass senrin-trial-panel"><div class="panel-title"><h3>センリンの三試練</h3><span>${[trials.still, trials.flow, trials.insight].filter(Boolean).length} / 3</span></div><div class="senrin-trial-ring" style="--trial-progress:${[trials.still, trials.flow, trials.insight].filter(Boolean).length}"><b>天空城</b></div><div class="senrin-trial-list"><span class="${trials.still ? 'complete' : ''}">第一「静」<small>QUEST 6-1</small></span><span class="${trials.flow ? 'complete' : ''}">第二「流」<small>QUEST 6-2</small></span><span class="${trials.insight ? 'complete' : ''}">第三「識」<small>QUEST 6-3</small></span></div></article>` : '';
  return `<section class="screen party-screen"><div class="eyebrow">RESCUE PARTY</div><h1 class="screen-title">救出した仲間</h1><p class="screen-copy">仲間は最初から使用できません。クエストで救出し、最大2人をサブメンバーとして同行させます。</p><div class="party-overview glass"><div><span>RESCUED</span><b>${progress.rescued} / ${progress.total}</b></div><div><span>FINAL ROUTE</span><b>${progress.finalUnlocked ? 'OPEN' : 'LOCKED'}</b></div><div class="party-slots">${partyMembers}</div></div>${sibling}${trialPanel}<div class="companion-grid">${cards}</div></section>`;
}

function chartPoints(values, width = 580, height = 150) {
  if (!values.length) return '';
  const max = Math.max(20, ...values);
  const min = Math.min(0, ...values);
  const range = Math.max(1, max - min);
  return values.map((value, index) => `${Math.round(index * width / Math.max(1, values.length - 1))},${Math.round(height - ((value - min) / range) * (height - 18) - 9)}`).join(' ');
}

function stats() {
  const unlocked = new Set(unlockedChars(profile));
  const weakList = weakestChars(profile, Math.min(8, unlocked.size));
  const selected = unlocked.has(state.analysisKey) ? state.analysisKey : (weakList[0] || CHAR_ORDER[0]);
  const selectedStats = getCharStats(profile, selected);
  const tries = selectedStats.hits + selectedStats.misses;
  const accuracy = tries ? Math.round(selectedStats.hits / tries * 100) : 0;
  const averageMs = selectedStats.samples ? Math.round(selectedStats.totalMs / selectedStats.samples) : 0;
  const history = profile.history.slice(0, 20).reverse();
  const recent = profile.history.slice(0, 8);
  const focus = weakList.slice(0, 3).map((char) => char.toUpperCase()).join(' / ');
  const historyRows = recent.length ? recent.map((entry) => `<div class="history-row"><span>${new Date(entry.t).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span><b>${entry.mode === 'BATTLE' ? 'QUEST' : entry.mode}</b><strong>${entry.wpm} WPM</strong><em>${entry.acc}%</em></div>`).join('') : '<p class="empty-analysis">まだ記録がありません。修練場を1回完了すると、ここに成長の履歴が表示されます。</p>';
  return `<section class="screen"><div class="eyebrow">ADAPTIVE ANALYSIS</div><h1 class="screen-title">文字習熟度</h1><p class="screen-copy">正確率・反応時間・入力回数をもとに、苦手キーを特定し、次の練習を最適化します。</p>
    <div class="analysis-summary">
      <article class="panel glass"><span>UNLOCKED</span><b>${profile.unlocked} <small>/ 48</small></b><p>使用可能なキー</p></article>
      <article class="panel glass"><span>WEAKEST</span><b>${focus || '—'}</b><p>次回の重点キー</p></article>
      <article class="panel glass"><span>RECENT AVG</span><b>${history.length ? Math.round(history.reduce((sum, entry) => sum + entry.wpm, 0) / history.length) : 0} <small>WPM</small></b><p>直近20回の平均</p></article>
    </div>
    <div class="dashboard-grid analysis-top">
      <article class="panel glass"><div class="panel-title"><h3>48キー・ヒートマップ</h3><span>SELECT A KEY</span></div><p class="analysis-caption">数値は正確率・反応時間・入力回数から算出した習熟度です。キーを選ぶと詳細を確認できます。</p><div class="key-grid analysis-key-grid">${CHAR_ORDER.map((char) => { const isUnlocked = unlocked.has(char); const score = isUnlocked ? mastery(profile, char) : 0; const level = !isUnlocked ? 'locked' : score < 45 ? 'weak' : score < 75 ? 'mid' : 'good'; return `<button class="key heat-key ${level} ${selected === char ? 'selected' : ''}" ${isUnlocked ? `data-key-detail="${char}"` : 'disabled'} title="${char.toUpperCase()} ${isUnlocked ? `${score}%` : 'LOCKED'}"><b>${char === ' ' ? 'SPACE' : char}</b><small>${isUnlocked ? score : '—'}</small></button>`; }).join('')}</div></article>
      <article class="panel glass key-detail"><div class="panel-title"><h3>キー詳細</h3><span>${selected.toUpperCase()}</span></div><div class="selected-key">${selected === ' ' ? 'SPACE' : selected}</div><div class="detail-metrics"><div><span>習熟度</span><b>${mastery(profile, selected)}%</b></div><div><span>正確率</span><b>${accuracy}%</b></div><div><span>平均反応</span><b>${averageMs || '—'}${averageMs ? 'ms' : ''}</b></div><div><span>入力回数</span><b>${tries}</b></div></div><p class="screen-copy">${tries ? `${selected.toUpperCase()} は現在 ${mastery(profile, selected)}% 習熟しています。練習ではこのキーの出題比率を自動で上げられます。` : 'まだこのキーの入力記録がありません。修練場で繰り返し入力して、習熟度を計測しましょう。'}</p><button class="button primary" data-action="practice" style="margin-top:20px">このキーを練習</button></article>
    </div>
    <div class="dashboard-grid analysis-bottom"><article class="panel glass"><div class="panel-title"><h3>WPM 推移</h3><span>LAST ${history.length}</span></div><div class="chart-wrap">${history.length ? `<svg viewBox="0 0 580 150" role="img" aria-label="WPM推移"><defs><linearGradient id="wpm-line" x1="0" x2="1"><stop stop-color="#3978ff"/><stop offset="1" stop-color="#20c7ff"/></linearGradient></defs><path d="M0 140H580" stroke="rgba(184,198,217,.14)"/><polyline points="${chartPoints(history.map((entry) => entry.wpm))}" fill="none" stroke="url(#wpm-line)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>` : '<p class="empty-analysis">プレイ履歴が増えると、ここにWPMの成長曲線が描かれます。</p>'}</div></article><article class="panel glass"><div class="panel-title"><h3>苦手キー上位</h3><span>ADAPTIVE TARGET</span></div>${weakList.map((char, index) => { const score = mastery(profile, char); return `<button class="weakness-row" data-key-detail="${char}"><b>${String(index + 1).padStart(2, '0')}</b><strong>${char.toUpperCase()}</strong><span><i style="width:${score}%"></i></span><em>${score}%</em></button>`; }).join('') || '<p class="empty-analysis">対象キーがありません。</p>'}</article></div>
    <article class="panel glass history-panel"><div class="panel-title"><h3>プレイ履歴</h3><span>RECENT SESSIONS</span></div>${historyRows}</article>
  </section>`;
}

function renderKeyboard(session) {
  const unlocked = new Set(unlockedChars(profile));
  const available = new Set(session.allowedChars || unlockedChars(profile));
  const expected = session.expected;
  const shiftBase = SHIFT_BASE[expected];
  const isActive = (key) => key === expected || key === shiftBase;
  const rows = KEYBOARD_ROWS.map((row) => `<div class="typing-kb-row">${row.map((key) => `<span class="typing-key ${isActive(key) ? 'next' : ''} ${available.has(key) ? '' : 'locked'} ${available.has(key) && !unlocked.has(key) ? 'king-preview' : ''}">${key}</span>`).join('')}</div>`).join('');
  return `<div class="typing-keyboard ${state.settings.keyboard ? '' : 'hidden'}">${rows}<div class="typing-kb-row bottom"><span class="typing-key shift ${shiftBase ? 'next' : ''}">SHIFT</span><span class="typing-key space ${expected === ' ' ? 'next' : ''}">SPACE</span></div></div>`;
}

function renderSupportSlots(battle) {
  if (!battle?.companions?.length) return '<span class="battle-support-empty">NO SUPPORT</span>';
  return battle.supportSlots().map((item) => {
    const status = battle.manualSupport ? (item.ready ? `ALT+${item.index + 1} READY` : `ALT+${item.index + 1} CHARGING`) : 'AUTO SUPPORT';
    return `<button class="battle-support-slot ${item.ready ? 'ready' : ''}" data-support-slot="${item.index}" ${battle.manualSupport && item.ready ? '' : 'disabled'} aria-label="${item.name}の支援技 ${status}">${companionPortrait(item, { compact: true })}<small class="battle-support-state">${status}</small></button>`;
  }).join('');
}

// 編成した仲間は支援バーだけでなく、戦闘空間の味方側にも常駐させる。
// 画像の暗い背景は screen 合成で戦場へ馴染ませ、最大2人を主人公の後方へ配置する。
function renderBattleCompanions(battle) {
  if (!battle?.companions?.length) return '';
  return `<div id="battle-companion-actors" class="battle-companion-actors" aria-label="同行中の仲間">${battle.companions.slice(0, 2).map((companion, index) => `<div class="battle-companion-actor companion-${companion.id} companion-slot-${index}" data-companion-id="${companion.id}" style="--companion:${companion.color}"><img src="${companion.art}" alt="${companion.name}が同行している" loading="eager" decoding="async"><i class="battle-companion-aura" aria-hidden="true"></i><span>${companion.label}</span></div>`).join('')}</div>`;
}

  function renderPhrase(session) {
    const start = session.text.lastIndexOf(' ', Math.max(0, session.index - 1)) + 1;
    const endAt = session.text.indexOf(' ', session.index);
    const end = endAt === -1 ? session.text.length : endAt;
    return [...session.text.slice(start, end)].map((char, offset) => {
      const index = start + offset;
      return `<span class="word-char ${index < session.index ? 'done' : index === session.index ? 'current' : ''}">${char}</span>`;
    }).join('');
}

function renderFinalShiftPhrase() {
  const finisher = state.finisher;
  if (!finisher) return '';
  return [...finisher.word].map((char, index) => (
    `<span class="word-char ${char === ' ' ? 'space' : ''} ${index < finisher.index ? 'done' : index === finisher.index ? 'current' : ''}">${char === ' ' ? '&nbsp;' : char}</span>`
  )).join('');
}

function battleActionCue(fx = state.attackFx) {
  const cues = {
    word: 'WORD COMPLETE',
    burst: 'BURST SHIFT',
    'boss-finisher-ready': 'CORE BREAK',
    'boss-finisher-strike': 'FINISHING SHIFT',
    'boss-finisher-dissolve': 'TARGET ERASED',
    'sovereign-law-stop': 'LAW SUSPENDED',
    'sovereign-allies': 'ALLIES LIGATURE',
    'sovereign-crown': 'CROWN SHATTER',
    'sovereign-strike': 'SOVEREIGN BREAK',
    'sovereign-chapter': 'CHAPTER RESTORED',
    'finisher-ready': 'FINAL SHIFT',
    'finisher-type': 'TYPE REWRITE',
    'finisher-miss': 'SEQUENCE ERROR',
    'finisher-strike': 'TERMINAL SLASH',
    'finisher-restored': 'RESTORATION COMPLETE',
    'origin-ready': 'ORIGIN CORE EXPOSED',
    'origin-type': 'WRITE THE WORLD',
    'origin-strike': 'ORIGIN SHIFT',
    'origin-restored': 'WORLD REWRITTEN',
    'battle-intro-arrival': 'THREAT DETECTED',
    'battle-intro-standoff': 'SOVEREIGN PRESSURE',
    'battle-intro-ready': 'BATTLE READY',
  };
  return cues[fx] || 'TYPE TO STRIKE';
}

function battleIntroPresentation() {
  const intro = state.battleIntro;
  if (!intro) return { label: '', title: '', copy: '' };
  const boss = state.battle?.enemy;
  const title = boss?.name || (intro.kind === 'god' ? '創世文字神' : '大ボス');
  const phases = {
    arrival: { label: intro.kind === 'god' ? 'DIVINE CHALLENGE' : 'BOSS ENCOUNTER', title, copy: '戦場の文字密度が上昇。敵の存在を検知しています。' },
    standoff: { label: intro.kind === 'king' ? 'SOVEREIGN PRESSURE' : 'BOSS PRESSURE', title: '特別な間', copy: '一呼吸置いて、敵の核と対峙する。' },
    ready: { label: 'COMBAT LINK', title: 'TYPE TO STRIKE', copy: 'Enterではなく、最初の一打で戦闘を開始します。' },
  };
  return phases[intro.phase] || phases.arrival;
}

function finalShiftPresentation() {
  const phase = state.finisher?.phase;
  if (state.finisher?.kind === 'origin') {
    if (phase === 'restored') return { title: 'WORLD REWRITTEN', copy: '六人の文字力が世界の因果を再構成した' };
    if (phase === 'cinematic') return { title: 'ORIGIN SHIFT', copy: '創世核へ最後の一撃を刻んでいます' };
    if (phase === 'typing') return { title: 'WRITE THE WORLD', copy: 'WRITE THE WORLD を入力して未来を選べ' };
    return { title: 'ORIGIN CORE EXPOSED', copy: '六人の仲間が創世核への道を開いた' };
  }
  if (phase === 'restored') {
    return { title: 'RESTORATION COMPLETE', copy: '文字核の修復に成功しました' };
  }
  if (phase === 'cinematic') {
    return { title: 'TERMINAL SLASH', copy: '終端文字列を書き換えています' };
  }
  if (phase === 'typing') {
    return { title: 'TYPE REWRITE', copy: 'REWRITE を入力して最後の一撃を放て' };
  }
  return { title: 'CORE EXPOSED', copy: '最終文字核を確認' };
}

function bossFinisherPresentation() {
  const finisher = state.bossFinisher;
  if (finisher?.kind !== 'sovereign') return { label: 'FINAL WAVE', title: 'FINISHING SHIFT', copy: 'CORE BREAK · 決着の一撃' };
  const phases = {
    'law-stop': { label: 'SOVEREIGN BREAK I', title: 'LAW SUSPENDED', copy: '王が支配する法則を停止' },
    allies: { label: 'SOVEREIGN BREAK II', title: 'ALLIES LIGATURE', copy: '章で救出した二人の文字力を連結' },
    crown: { label: 'SOVEREIGN BREAK III', title: 'CROWN SHATTER', copy: '王冠ルーンと王権結界を破砕' },
    strike: { label: 'SOVEREIGN BREAK IV', title: 'SOVEREIGN BREAK', copy: 'レンの一撃で王権核を断つ' },
    chapter: { label: 'CHAPTER RESTORED', title: finisher.chapterTitle || 'CHAPTER COMPLETE', copy: '次章へ続く文字門が開かれた' },
  };
  return phases[finisher.phase] || phases['law-stop'];
}

function renderDialogueScene() {
  const dialogue = state.dialogue;
  if (!dialogue) return '';
  const stage = STAGES.find((item) => item.id === dialogue.stageId) || STAGES[0];
  const line = dialogue.lines[dialogue.index];
  const bossId = dialogue.enemyId || stage.pool.boss[0];
  const boss = ENEMIES[bossId];
  const progress = dialogue.lines.map((_, index) => `<i class="${index <= dialogue.index ? 'active' : ''}"></i>`).join('');
  const color = stage.element === 'flame' ? '#ff6675' : stage.element === 'light' ? '#dceeff' : '#8b5cff';
  return `<section class="screen dialogue-screen stage-${stage.id}" style="--scene-color:${color}"><header class="dialogue-head"><div><div class="eyebrow">${dialogue.chapter} // ${stage.name}</div><h1 class="screen-title">${dialogue.subtitle}</h1></div><button class="button secondary dialogue-skip" data-dialogue-skip>会話をスキップ <span class="key">ESC</span></button></header><article class="dialogue-cinematic glass"><div class="dialogue-sky"><span class="dialogue-rune r1">TYPE SHIFT</span><span class="dialogue-rune r2">REWRITE REALITY</span><span class="dialogue-rune r3">[ ${String(stage.id).padStart(2, '0')} ]</span></div><div class="dialogue-hero ${line.side === 'ren' ? 'speaking' : ''}"><img src="assets/ren-aster-keyart-v2.png" alt="レン・アスターの会話立ち絵" decoding="async"></div><div class="dialogue-enemy ${line.side === 'enemy' ? 'speaking' : ''}">${enemyArt(bossId, boss, { battle: true })}</div><div class="dialogue-gradient"></div><div class="dialogue-location"><span>RESTORATION AREA</span><b>${stage.name}</b><small>${stage.element.toUpperCase()} DISTORTION</small></div><div class="dialogue-box ${line.side}"><div class="dialogue-speaker"><span>${line.role}</span><strong>${line.speaker}</strong></div><p>${line.text}</p><div class="dialogue-footer"><div class="dialogue-progress">${progress}</div><button class="dialogue-next" data-dialogue-next>${dialogue.index + 1 >= dialogue.lines.length ? '戦闘開始' : '次へ'} <span>ENTER</span></button></div></div></article><p class="dialogue-hint">クリックまたは <kbd>Enter</kbd> で進む　·　<kbd>Esc</kbd> でスキップ</p></section>`;
}

function practice() {
  if (!state.session) {
    const weak = weakestChars(profile, 3).map((char) => char.toUpperCase()).join(' / ');
    return `<section class="screen practice-select"><div class="eyebrow">TRAINING CHAMBER</div><h1 class="screen-title">修練場</h1><p class="screen-copy">入力の精度と速度を、世界を修復する力へ変える。</p><div class="mode-grid"><article class="mode-card glass"><span>01</span><h2>TIME ATTACK</h2><p>60秒間で、どこまで正確に打ち抜けるか。</p><button class="button primary" data-mode="TIME ATTACK">60秒開始</button></article><article class="mode-card glass"><span>02</span><h2>ENDLESS</h2><p>自分のペースで続け、任意のタイミングで記録する。</p><button class="button secondary" data-mode="ENDLESS">開始する</button></article><article class="mode-card glass"><span>03</span><h2>TRAINING</h2><p>苦手キー <b>${weak || '—'}</b> に集中した適応練習。</p><button class="button secondary" data-mode="TRAINING">集中練習</button></article></div></section>`;
  }
  if (state.dialogue) return renderDialogueScene();

  function renderBattleScene(enemy, battle) {
    if (!enemy) return '';
    const finisherHoldsCore = state.bossFinisher && state.bossFinisher.phase !== 'dissolve';
    const visibleEnemyHp = finisherHoldsCore ? Math.max(1, enemy.hp) : enemy.hp;
    const hp = Math.max(0, visibleEnemyHp / enemy.maxHp * 100);
    const battleMaxHp = battle.playerMaxHp;
    const fx = state.attackFx || 'idle';
    const weak = battle.weakChar?.toUpperCase() || '—';
    const elementState = battle.elementState;
    const playerHpRate = Math.max(0, battle.playerHp / battleMaxHp * 100);
    const waveRate = (battle.waveIndex + 1) / battle.stage.waves.length * 100;
    const actionCue = battleActionCue(fx);
    const finalShift = finalShiftPresentation();
    const campaignKind = battle.campaignNode?.kind || '';
    const kingBattle = campaignKind === 'king';
    const originBattle = campaignKind === 'god';
    const battleArtKey = originBattle ? 'god' : battle.stage.id;
    const battleArt = STAGE_ART[battleArtKey] || STAGE_ART[1];
    const battleVisualStage = originBattle ? { ...battle.stage, artKey: 'god' } : battle.stage;
    const finisherPresentation = bossFinisherPresentation();
    const introPresentation = battleIntroPresentation();
    const sovereignHud = kingBattle ? `<div class="sovereign-battle-hud"><span>SOVEREIGN BATTLE</span><strong>${battle.campaignNode.title}</strong><small>LAW CORE · ${battle.campaignNode.label}</small><i></i></div>` : '';
    const originHud = originBattle ? `<div class="origin-battle-hud"><span id="origin-phase-label">DIVINE PHASE ${enemy.godPhase} / 4</span><strong id="origin-phase-name">${enemy.phaseName || '創造'}</strong><small id="origin-phase-copy">${enemy.godPhase === 4 ? 'SIX ALLIES CONNECTED' : 'ALPHA ORIGIN IS REWRITING REALITY'}</small><i></i></div>` : '';
    const supportClass = state.lastSupport ? `support-fx support-${state.lastSupport.id || 'generic'} support-cycle-${state.supportFxCycle % 2}` : '';
    return `<article id="battle-panel" class="battle-panel battle-art glass ${fx} fx-cycle-${state.attackFxCycle % 2} ${supportClass} stage-${battle.stage.id} ${kingBattle ? 'sovereign-battle' : ''} ${originBattle ? `origin-battle origin-phase-${enemy.godPhase}` : ''}" style="--enemy:${enemy.color};--damage:${(1 - hp / 100).toFixed(2)};--stage-color:${battleArt.color}">
      ${stageEnvironment(battleVisualStage, 'battle-stage-art')}
      <div id="battle-intro" class="battle-intro ${state.battleIntro?.kind || ''} ${state.battleIntro?.phase || ''}" ${state.battleIntro ? '' : 'hidden'}><span id="battle-intro-label">${introPresentation.label}</span><strong id="battle-intro-title">${introPresentation.title}</strong><p id="battle-intro-copy">${introPresentation.copy}</p></div>
      ${sovereignHud}
      ${originHud}
      <div id="battle-player-actor" class="battle-player-actor" aria-label="レン・アスター">
        <img id="battle-player-image" class="battle-player-pose-idle" src="${BATTLE_PLAYER_ART.idle}" alt="レン・アスターが${battle.stats.weapon.name}を構える" decoding="async">
        <img class="battle-player-pose-strike" src="${BATTLE_PLAYER_ART.strike}" alt="" aria-hidden="true" decoding="async">
        <i class="battle-player-shadow" aria-hidden="true"></i>
      </div>
      ${renderBattleCompanions(battle)}
      <div class="battle-vignette"></div>
      <header class="battle-top-rail">
        <div class="battle-brand-lockup"><strong>TYPE SHIFT</strong><small>REWRITE REALITY</small></div>
        <div class="battle-wave-rail">
          <span id="battle-wave">${originBattle ? 'PHASE' : 'WAVE'} ${battle.waveIndex + 1} / ${battle.stage.waves.length}</span>
          <i><b id="battle-wave-fill" style="width:${waveRate}%"></b></i>
        </div>
        <div class="battle-burst-rail">
          <span id="battle-burst">BURST ${battle.burst}%</span>
          <i><b id="battle-burst-fill" style="width:${battle.burst}%"></b></i>
          <small>TAB</small>
        </div>
        <button class="battle-exit" data-route="quest" aria-label="クエストを離脱">×</button>
      </header>
      <div class="battle-weapon-loadout">${weaponArt(battle.stats.weapon.id, battle.stats.weapon, { micro: true, plus: battle.stats.plus, equipped: true })}<span><small>ACTIVE WEAPON</small><b>${battle.stats.weapon.name} +${battle.stats.plus}</b></span></div>
      <div id="battle-enemy-canvas" class="battle-enemy-canvas" style="${enemyBattleStyle(enemy.id, enemy)}">${enemyArt(enemy.id, enemy, { battle: true })}</div>
      <div class="battle-ground-contact" aria-hidden="true"></div>
      <div class="battle-scene-grade" aria-hidden="true"></div>
      <div class="battle-foreground-fog" aria-hidden="true"></div>
      <div class="enemy-damage-state"></div>
      <div class="word-bloom"></div>
      <div class="burst-sigil"><i></i><i></i><i></i></div>
      <div class="battle-hud-overlay">
        <div class="battle-player-hud">
          <figure class="battle-hud-portrait player"><img src="assets/ren-aster-keyart-v2.png" alt="レン・アスター"></figure>
          <div class="battle-hud-copy">
            <div class="battle-hud-label"><span>HP</span><b id="battle-player-hp">${battle.playerHp} / ${battle.playerMaxHp}</b></div>
            <div class="bar"><i id="battle-player-fill" style="width:${playerHpRate}%"></i></div>
            <small>REN ASTER · ${battle.stats.weapon.element.toUpperCase()}</small>
          </div>
        </div>
        <div class="battle-enemy-hud">
          <div class="battle-hud-copy">
            <div class="battle-hud-label"><span>ENEMY</span><b id="battle-enemy-hp">${visibleEnemyHp} / ${enemy.maxHp}</b></div>
            <div class="bar"><i id="battle-enemy-fill" style="width:${hp}%;background:var(--enemy)"></i></div>
            <strong id="battle-enemy-name">${enemy.name}</strong>
            <small id="battle-enemy-meta">${enemy.tier.toUpperCase()} · ${enemy.element.toUpperCase()} · ${elementState.label} · WEAK ${weak}</small>
            <small id="battle-enemy-trait" class="enemy-trait">${enemy.traitText}</small>
            <div class="enemy-attack-label"><span>ENEMY ATTACK</span><b id="battle-attack-value">${Math.round(battle.attackGauge)}%</b></div>
            <div class="enemy-attack-bar"><i id="battle-attack-fill" style="width:${battle.attackGauge}%"></i></div>
          </div>
          <figure class="battle-hud-portrait enemy">${enemyArt(enemy.id, enemy)}</figure>
        </div>
      </div>
      <div id="battle-readout" class="combat-readout">${state.lastDamage ? `HIT  -${state.lastDamage} DAMAGE` : ''}</div>
      <div class="battle-status"><strong id="battle-action-cue">${actionCue}</strong></div>
      <div class="impact-slash"></div>
      <div class="impact-burst">✦</div>
      <div id="battle-damage-pop" class="damage-pop" ${state.lastDamage ? '' : 'hidden'}>${state.lastDamage ? `-${state.lastDamage}` : ''}</div>
      <div id="battle-final-shift" class="battle-final-shift ${state.finisher?.phase || ''}" ${state.finisher ? '' : 'hidden'}>
        <span>${state.finisher?.kind === 'origin' ? 'FINAL DIVINE PHASE' : 'FINAL SHIFT'}</span>
        <strong id="battle-final-title">${finalShift.title}</strong>
        <p id="battle-final-copy">${finalShift.copy}</p>
      </div>
      <div id="battle-boss-finisher" class="battle-boss-finisher ${state.bossFinisher?.kind || ''} ${state.bossFinisher?.phase || ''}" ${state.bossFinisher ? '' : 'hidden'}><span id="battle-boss-finisher-label">${finisherPresentation.label}</span><strong id="battle-boss-finisher-title">${finisherPresentation.title}</strong><p id="battle-boss-finisher-copy">${finisherPresentation.copy}</p></div>
      <div id="battle-victory" class="battle-victory" ${state.victory ? '' : 'hidden'}><div class="victory-mark">✦</div><strong>WIN</strong><span>QUEST COMPLETE</span><p data-victory-next>ENTER で結果へ</p></div>
      <div id="battle-defeat" class="battle-defeat" ${state.defeat ? '' : 'hidden'}><div class="defeat-mark">✕</div><strong>LOSE</strong><span>SHIFTER DOWN</span><p>ENTER で再挑戦　·　ESC でクエストへ</p></div>
    </article>`;
  }
  const session = state.session;
  const isTime = session.mode === 'TIME ATTACK';
  const enemy = state.battle?.enemy;
    const battleInfo = renderBattleScene(enemy, state.battle);
    const supportFacesNow = renderSupportSlots(state.battle);
    const supportTextNow = state.lastSupport ? `${state.lastSupport.name}${state.lastSupport.damage ? ` / +${state.lastSupport.damage}` : ''}${state.lastSupport.heal ? ` / HP +${state.lastSupport.heal}` : ''}${state.lastSupport.burst ? ` / BURST +${state.lastSupport.burst}` : ''}` : state.battle?.manualSupport ? 'SUPPORT CHARGE · ALT+1 / ALT+2' : 'SUPPORT AUTO';
    const siblingBattle = state.battle?.hasCompanion('nox') && state.battle.companionData.brothersReconciled
      ? `<div class="battle-sibling-link glass ${state.battle.ligatureReady ? 'ready' : ''} ${state.battle.ligatureActive ? 'active' : ''}"><span>ASTER LIGATURE</span><div class="bar"><i id="battle-sibling-fill" style="width:${state.battle.companionData.siblingGauge}%"></i></div><b id="battle-sibling-value">${state.battle.ligatureActive ? 'LINK ACTIVE' : state.battle.ligatureReady ? 'NEXT WORD' : `${state.battle.companionData.siblingGauge}%`}</b></div>` : '';
    const supportBar = state.battle ? `<div class="battle-support-bar glass"><div id="battle-support-faces">${supportFacesNow}</div><strong id="battle-support-text">${supportTextNow}</strong><button class="button secondary" data-route="party">編成</button></div>${siblingBattle}` : '';
    const metrics = `<div class="practice-metrics glass"><div><span>WPM</span><b id="metric-wpm">0</b></div><div><span>ACCURACY</span><b id="metric-acc">100%</b></div><div><span>COMBO</span><b id="metric-combo">0</b></div><div><span>BEST</span><b id="metric-best">0</b></div></div>`;
    const battleMetrics = `<div class="practice-metrics battle-metrics glass"><div class="battle-input-flow" aria-hidden="true"><i></i><b></b></div><div><span>WPM</span><b id="metric-wpm">0</b></div><div><span>ACCURACY</span><b id="metric-acc">100%</b></div><div><span>COMBO</span><b id="metric-combo">0</b></div></div>`;
    const typingLength = state.finisher?.word.length || session.text.length;
    const typingIndex = state.finisher?.index || 0;
    const typingPhrase = state.finisher ? renderFinalShiftPhrase() : renderPhrase(session);
    const typingFeedback = state.finisher ? (state.finisher.kind === 'origin' ? 'WRITE THE WORLD を入力して未来を選べ' : 'REWRITE を入力して終端を断て') : '入力を開始してください';
    const typingHint = state.finisher ? (state.finisher.kind === 'origin' ? '六人の文字力を束ね、創世神へORIGIN SHIFTを放ちます。' : '最後の文字列を正確に入力すると、とどめの一撃が発動します。') : '表示された英単語を左から入力してください。単語を完成させると追撃が発生します。<kbd>Esc</kbd> でやり直せます。';
    const typingStage = `<article class="typing-stage glass ${state.finisher ? 'finisher-mode' : ''}"><div class="typing-status"><span id="typing-progress">${typingIndex} / ${typingLength}</span><span id="typing-feedback">${typingFeedback}</span></div><div class="typing-phrase" id="typing-phrase">${typingPhrase}</div><p class="typing-hint">${typingHint}</p></article>`;
    const practiceHeader = `<header class="practice-head"><div><div class="eyebrow">${session.mode}</div><h1 class="screen-title">文字を、力に変えろ。</h1></div><div class="practice-actions">${isTime ? '<span id="practice-clock" class="clock">60.0</span>' : ''}${state.battle ? '<button class="button secondary" data-route="quest">クエストを離脱</button>' : '<button class="button secondary" data-action="finish">終了して記録</button>'}</div></header>`;
    if (state.battle) return `<section class="screen practice-screen battle-practice-screen"><div class="battle-unified-frame">${battleInfo}${supportBar}<div class="battle-command-deck">${typingStage}${battleMetrics}</div></div>${renderKeyboard(session)}</section>`;
    return `<section class="screen practice-screen">${practiceHeader}${metrics}${typingStage}${renderKeyboard(session)}</section>`;
}

  function result() {
    const r = state.lastResult;
    if (!r) return home();
    const battle = r.mode === 'BATTLE';
    const materials = r.materials || { kotonoha: 0, shard: 0 };
    const nextNode = r.nextNodeId ? campaignNodeById(r.nextNodeId) : null;
    const canAdvance = Boolean(battle && nextNode && campaignNodeIsUnlocked(profile, nextNode.id));
    const nextActionLabel = nextNode?.kind === 'king' ? '次の王戦へ' : nextNode?.kind === 'god' ? '神域へ進む' : '次のクエストへ';
    const nextArea = canAdvance ? `<article class="reward-card unlock"><span>NEXT DESTINATION</span><b>${r.nextStage || nextNode.title}</b><small>Enterまたは下のボタンで続行できます</small></article>` : r.nextStage ? `<article class="reward-card unlock"><span>NEXT AREA</span><b>${r.nextStage}</b><small>クエスト一覧から挑戦できます</small></article>` : battle ? `<article class="reward-card unlock"><span>ARCHIVE</span><b>ALL AREAS RESTORED</b><small>すべての区画を修復しました</small></article>` : '';
    const materialRewards = battle ? `<article class="reward-card"><span>言片</span><b>+${materials.kotonoha}</b><small>武器強化素材</small></article>${materials.shard ? `<article class="reward-card rare"><span>輝晶</span><b>+${materials.shard}</b><small>武器進化素材</small></article>` : ''}` : '';
    const lootRewards = battle ? (r.drops || []).map((drop) => { const source = ENEMIES[drop.enemyId]; const color = source?.color || 'var(--gold)'; const mark = source?.artMark || '◇'; return `<article class="reward-card loot rarity-${drop.rarity.toLowerCase()}" style="--codex-color:${color}"><div class="loot-glyph result-loot-glyph" aria-hidden="true"><i>${mark}</i><span>${drop.rarity}</span></div><span>${drop.rarity} · ${drop.category}</span><b>${drop.name}</b><small>+${drop.count} · 敵図鑑の戦利品記録へ登録</small></article>`; }).join('') : '';
    const rescuedCompanion = r.rescueId ? companionById(r.rescueId) : null;
    const rescueReward = rescuedCompanion ? `<article class="reward-card unlock companion-result"><div class="rescue-reveal-art"><img src="${rescuedCompanion.art}" alt="${rescuedCompanion.name}の救出イラスト" loading="eager" decoding="async"><i aria-hidden="true"></i></div><div><span>RESCUED · ${rescuedCompanion.role.toUpperCase()}</span><b>${rescuedCompanion.name}</b><small>封印文字を破砕。仲間画面で同行設定できます。</small></div></article>` : r.rescueBlocked ? `<article class="reward-card rare companion-result"><span>RESCUE TRIAL</span><b>救出条件未達</b><small>${r.rescueBlocked}</small></article>` : '';
    const trialResults = r.rescueConditions?.length ? `<section class="result-trials glass"><div class="panel-title"><h3>救出条件</h3><span>${r.rescueConditions.filter((item) => item.passed).length} / ${r.rescueConditions.length}</span></div>${r.rescueConditions.map((item) => `<div class="trial-result ${item.passed ? 'complete' : ''}"><b>${item.passed ? '✓' : '—'}</b><span>${item.label}<small>${item.current} / ${item.target}</small></span></div>`).join('')}</section>` : '';
    let brotherResult = r.rescueId === 'nox' || r.companionBond?.reconciled ? `<article class="reward-card unlock"><span>BROTHERS</span><b>ASTER LIGATURE</b><small>レンとノクスが正式に再会。兄弟連携を解放しました</small></article>` : '';
    const chapterResult = r.chapterComplete ? `<article class="reward-card rare"><span>SOVEREIGN BREAK</span><b>${r.chapterComplete}</b><small>王権核を破壊し、次章へ続く文字門を解放しました</small></article>` : '';
    const originResult = r.originShift ? `<article class="reward-card unlock origin-result"><span>ORIGIN SHIFT</span><b>WRITE THE WORLD</b><small>六人の仲間と創世神を越え、世界の未来を書き直しました</small></article>` : '';
    brotherResult += chapterResult + originResult;
    const levelUp = r.levelsGained ? `<article class="reward-card level"><span>LEVEL UP</span><b>LV +${r.levelsGained}</b><small>スキルポイント +${r.levelsGained}</small></article>` : '';
    const metaRewards = `${r.meta?.dailyGold ? `<article class="reward-card rare"><span>DAILY BONUS</span><b>+${r.meta.dailyGold} G</b><small>達成済みデイリー報酬</small></article>` : ''}<article class="reward-card"><span>BOND</span><b>+${r.meta?.bondEarned || 0}</b><small>${r.meta?.bondLevels ? `絆レベル +${r.meta.bondLevels}` : 'アーカイブ・ヘイヴン'}</small></article>${r.meta?.achievements?.length ? `<article class="reward-card unlock"><span>ACHIEVEMENT</span><b>${r.meta.achievements.join(' / ')}</b><small>新しい実績を解除</small></article>` : ''}${r.meta?.titles?.length ? `<article class="reward-card unlock"><span>NEW TITLE</span><b>${r.meta.titles.join(' / ')}</b><small>キャラクター画面で装備できます</small></article>` : ''}`;
    const resultActions = battle
      ? `${canAdvance ? `<button class="button primary" data-action="next-node">${nextActionLabel} <span class="key">ENTER</span></button>` : '<button class="button primary" data-route="quest">クエスト一覧へ</button>'}<button class="button secondary" data-action="again">修練場へ</button><button class="button secondary" data-route="party">仲間を確認</button>`
      : `<button class="button primary" data-action="again">もう一度修練</button><button class="button secondary" data-route="home">ホームへ戻る</button>`;
    return `<section class="screen result-screen"><div class="eyebrow">${battle ? 'QUEST COMPLETE' : 'SESSION ARCHIVED'}</div><h1 class="screen-title">${battle ? `${r.stage} を修復` : '修復記録'}</h1><p class="screen-copy">${battle ? `評価 ${'★'.repeat(r.stars || 1)}。獲得した報酬は育成画面で使用できます。` : '一連の入力が、アーカイブへ保存されました。'}</p><div class="result-grid"><article class="result-hero glass"><span>${r.mode}</span><b>${battle ? '★'.repeat(r.stars || 1) : r.score.toLocaleString()}</b><p>${battle ? 'RESTORATION RANK' : 'SHIFT SCORE'}</p></article><article class="result-stat glass"><span>WPM</span><b>${r.wpm}</b></article><article class="result-stat glass"><span>ACCURACY</span><b>${r.acc}%</b></article><article class="result-stat glass"><span>MAX COMBO</span><b>${r.combo}</b></article></div><section class="result-rewards"><div class="reward-section-head"><span>獲得報酬</span><small>${battle ? 'QUEST REWARD' : 'SESSION REWARD'}</small></div><div class="reward-card-grid"><article class="reward-card"><span>GOLD</span><b>+${r.gold}</b><small>装備の購入・強化</small></article><article class="reward-card"><span>XP</span><b>+${r.xp}</b><small>シフター経験値</small></article>${materialRewards}${lootRewards}${rescueReward}${brotherResult}${levelUp}${metaRewards}${nextArea}</div></section>${trialResults}<div class="result-note glass"><span>記録</span><b>ミス ${r.miss}</b><b>完成単語 ${r.words || 0}</b><b>プレイ ${Math.max(1, Math.round((r.playMs || 0) / 1000))} 秒</b></div><div class="hero-actions">${resultActions}</div></section>`;
}

function armory() {
  const rpg = ensureRpg(profile);
  const stats = combatStats(profile);
  const branches = [...new Set(SKILLS.map((skill) => skill.branch))];
  const weaponCards = WEAPONS.map((weapon) => {
    const owned = rpg.weapons.owned.includes(weapon.id);
    const plus = weaponPlus(profile, weapon.id);
    const cost = enhanceCost(profile, weapon.id);
    const equipped = rpg.weapons.equipped === weapon.id;
    const cap = weapon.rarity === 'SSR' ? 15 : weapon.rarity === 'SR' ? 12 : 10;
    const canEvolve = Boolean(weapon.evolve);
    return `<article class="weapon-card glass rarity-${weapon.rarity.toLowerCase()} ${equipped ? 'equipped' : ''} ${owned ? '' : 'locked'}">${weaponArt(weapon.id, weapon, { locked: !owned, plus, equipped })}<div class="weapon-card-copy"><span>${weapon.rarity} / ${weapon.element.toUpperCase()}</span><h3>${weapon.name}</h3><p>ATK +${weapon.atk} / ダメージ倍率 ×${weapon.mult.toFixed(2)} / 強化 +${plus}</p><div class="weapon-upgrade"><div class="bar"><i style="width:${Math.round(plus / cap * 100)}%"></i></div><small>強化 ${plus} / ${cap}${canEvolve ? ` · 進化素材 ${weapon.evolveCost} 輝晶` : ''}</small></div></div><div class="weapon-actions"><button class="button ${equipped ? 'primary' : 'secondary'}" data-weapon="${weapon.id}">${equipped ? '装備中' : owned ? '装備' : `${weapon.cost}Gで購入`}</button>${owned ? `<button class="button secondary" data-enhance="${weapon.id}">強化 ${cost.gold}G / 言片${cost.kotonoha}</button>${canEvolve ? `<button class="button secondary" data-evolve="${weapon.id}">進化</button>` : ''}` : ''}</div></article>`;
  }).join('');
  const skillTree = branches.map((branch) => {
    const branchSkills = SKILLS.filter((skill) => skill.branch === branch);
    const learned = branchSkills.filter((skill) => rpg.skills.tree.includes(skill.id)).length;
    return `<section class="skill-branch"><div class="skill-branch-head"><b>${branch}</b><span>${learned}/${branchSkills.length}</span></div><div class="skill-lane">${branchSkills.map((skill) => {
      const owned = rpg.skills.tree.includes(skill.id);
      const locked = skill.requires && !rpg.skills.tree.includes(skill.requires);
      return `<article class="skill-node ${owned ? 'learned' : ''} ${locked ? 'locked' : ''}"><i>${skill.tier}</i><div><h4>${skill.name}</h4><p>${skill.text}</p><small>${skill.requires ? `前提: ${SKILLS.find((item) => item.id === skill.requires)?.name || skill.requires}` : '基礎スキル'}</small></div><button class="button secondary" data-skill="${skill.id}" ${owned || locked ? 'disabled' : ''}>${owned ? '習得済み' : locked ? '前提未達' : `SP ${skill.cost}`}</button></article>`;
    }).join('')}</div></section>`;
  }).join('');
  return `<section class="screen"><div class="eyebrow">GROWTH ARCHIVE</div><h1 class="screen-title">武器とスキル</h1><p class="screen-copy">Gold ${rpg.gold} / SP ${rpg.sp} / 言片 ${rpg.materials.kotonoha} / 輝晶 ${rpg.materials.shard}。現在のATK ${Math.round(stats.atk)}、最大HP ${stats.maxHp}。</p><div class="armory-layout"><article class="panel glass"><div class="panel-title"><h3>シフトブレード武器庫</h3><span>${getWeapon(profile).name}</span></div><div class="weapon-grid">${weaponCards}</div></article><article class="panel glass skill-tree-panel"><div class="panel-title"><h3>スキルツリー</h3><span>${rpg.skills.tree.length}/${SKILLS.length}</span></div>${skillTree}</article></div></section>`;
}
function codex() {
  const rpg = ensureRpg(profile);
  profile.meta.codex ??= { enemies: [], weapons: ['starter'] };
  profile.meta.codex.enemyRecords ??= {};
  profile.meta.codex.drops ??= {};
  profile.meta.codex.weapons ??= ['starter'];
  const records = profile.meta.codex.enemyRecords;
  const dropInventory = profile.meta.codex.drops;
  const enemyEntries = Object.entries(ENEMIES);
  const enemyFound = enemyEntries.filter(([id]) => records[id]?.encounters > 0).length;
  const dropFound = enemyEntries.filter(([, enemy]) => (dropInventory[enemy.drop.id] || 0) > 0).length;
  const knownWeapons = new Set([...profile.meta.codex.weapons, ...rpg.weapons.owned]);
  Object.entries(rpg.weapons.evolved || {}).forEach(([id, evolved]) => { if (evolved) knownWeapons.add(id); });
  const weaponFound = WEAPONS.filter((weapon) => knownWeapons.has(weapon.id)).length;
  const achievements = new Set(profile.meta.achievements);
  const ownedTitles = new Set(profile.meta.titles.owned);
  const equippedTitle = getTitle(profile);
  const bond = bondProgress(profile);
  const tabButton = (id, label, count) => `<button class="codex-tab ${state.codexTab === id ? 'active' : ''}" data-codex-tab="${id}"><span>${label}</span><b>${count}</b></button>`;

  const enemyGrid = `<div class="codex-grid">${enemyEntries.map(([id, enemy], index) => {
    const record = records[id];
    const found = Boolean(record?.encounters);
    const locations = enemyLocations(id);
    const dropCount = dropInventory[enemy.drop.id] || 0;
    const dropRate = `${Math.round(enemy.drop.chance * 100)}%`;
    return `<article class="codex-card enemy-codex-card glass ${found ? '' : 'undiscovered'}" style="--codex-color:${enemy.color}"><div class="codex-card-number">${String(index + 1).padStart(2, '0')}</div><div class="codex-enemy-art">${enemyArt(id, enemy, { locked: !found })}</div><div class="codex-card-copy"><span>${found ? `${enemy.family} · ${enemy.tier.toUpperCase()} · ${enemy.element.toUpperCase()}` : 'UNKNOWN ENTITY'}</span><h3>${found ? enemy.name : '未発見'}</h3><p>${found ? enemy.traitText : 'クエストで遭遇すると情報が解放されます。'}</p>${found ? `<div class="codex-detail-list"><div><span>出現</span><b>${locations.join('<br>')}</b></div><div class="codex-drop-line ${dropCount ? 'acquired' : ''}"><span>ドロップ ${dropRate}</span><b>${enemy.drop.name}</b><em>${dropCount ? `所持 ${dropCount}` : '未獲得'}</em></div></div><div class="codex-record"><b>遭遇 ${record.encounters}</b><b>撃破 ${record.kills}</b></div>` : '<div class="codex-lock">LOCKED</div>'}</div></article>`;
  }).join('')}</div>`;

  const dropGrid = `<div class="codex-grid loot-codex-grid">${enemyEntries.map(([id, enemy], index) => {
    const count = dropInventory[enemy.drop.id] || 0;
    const sourceKnown = Boolean(records[id]?.encounters);
    const locations = enemyLocations(id);
    return `<article class="codex-card loot-codex-card glass ${sourceKnown ? '' : 'undiscovered'} rarity-${enemy.drop.rarity.toLowerCase()}" style="--codex-color:${enemy.color}"><div class="codex-card-number">${String(index + 1).padStart(2, '0')}</div><div class="loot-glyph" aria-hidden="true"><i>${enemy.artMark || '◇'}</i><span>${enemy.drop.rarity}</span></div><div class="codex-card-copy"><span>${sourceKnown ? `${enemy.drop.rarity} · ${enemy.drop.category}` : 'UNKNOWN RELIC'}</span><h3>${sourceKnown ? enemy.drop.name : '未解析の戦利品'}</h3><p>${sourceKnown ? enemy.drop.description : '対象の敵と遭遇すると、入手経路が解析されます。'}</p>${sourceKnown ? `<div class="codex-detail-list"><div><span>入手元</span><b>${enemy.name}</b></div><div><span>出現領域</span><b>${locations.join('<br>')}</b></div></div><div class="loot-count ${count ? 'acquired' : ''}"><span>${count ? 'ARCHIVED' : `DROP RATE ${Math.round(enemy.drop.chance * 100)}%`}</span><b>${count ? `× ${count}` : '未獲得'}</b></div>` : '<div class="codex-lock">LOCKED</div>'}</div></article>`;
  }).join('')}</div>`;

  const weaponGrid = `<div class="codex-grid weapon-codex-grid">${WEAPONS.map((weapon, index) => {
    const found = knownWeapons.has(weapon.id);
    const plus = found ? weaponPlus(profile, weapon.id) : 0;
    const equipped = rpg.weapons.equipped === weapon.id;
    return `<article class="codex-card weapon-codex-card glass ${found ? '' : 'undiscovered'} rarity-${weapon.rarity.toLowerCase()}" style="--codex-color:${weapon.element === 'flame' ? '#ff6675' : weapon.element === 'shadow' ? '#8b5cff' : weapon.element === 'light' ? '#e8e2c4' : '#7f94a9'}"><div class="codex-card-number">${String(index + 1).padStart(2, '0')}</div><div class="codex-weapon-art">${weaponArt(weapon.id, weapon, { locked: !found, compact: true, plus, equipped })}</div><div class="codex-card-copy"><span>${found ? `${weapon.rarity} · ${weapon.element.toUpperCase()}` : 'UNKNOWN WEAPON'}</span><h3>${found ? weapon.name : '未入手'}</h3><p>${found ? `ATK +${weapon.atk} / 強化 +${plus} / ダメージ倍率 ×${weapon.mult.toFixed(2)}` : '武器の購入または進化で情報が解放されます。'}</p>${equipped ? '<div class="codex-equipped">EQUIPPED</div>' : found ? '<div class="codex-unlocked">ARCHIVED</div>' : '<div class="codex-lock">LOCKED</div>'}</div></article>`;
  }).join('')}</div>`;

  const companionData = ensureCompanions(profile);
  const rescuedCompanions = new Set(companionData.rescued);
  const companionGrid = `<div class="codex-grid companion-codex-grid">${COMPANIONS.map((companion, index) => {
    const found = rescuedCompanions.has(companion.id);
    const bond = companionBondProgress(profile, companion.id);
    const isNox = companion.id === 'nox';
    const name = found ? companion.name : isNox ? 'NOX_' : '未発見';
    const relation = found && isNox ? 'レン・アスターの弟' : found ? companion.role : 'UNKNOWN COMPANION';
    return `<article class="codex-card companion-codex-card glass ${found ? '' : 'undiscovered'}" style="--codex-color:${companion.color}"><div class="codex-card-number">${String(index + 1).padStart(2, '0')}</div><div class="codex-companion-art">${companionPortrait(companion, { locked: !found })}</div><div class="codex-card-copy"><span>${relation}</span><h3>${name}</h3><p>${found ? `${companion.story} 武器：${companion.weapon}。支援技：${companion.supportName}。` : `ステージ${companion.unlockStage}の第5クエストをクリアするとプロフィールが復元されます。`}</p>${found ? `<div class="codex-record"><b>BOND ${bond.rank} / 5</b><b>${bond.points} PT</b></div>` : '<div class="codex-lock">IDENTITY LOST</div>'}</div></article>`;
  }).join('')}</div>`;

  const missionPanels = `<div class="meta-summary"><article class="panel glass"><div class="panel-title"><h3>実績</h3><span>${achievements.size} / ${ACHIEVEMENTS.length}</span></div><div class="achievement-grid">${ACHIEVEMENTS.map((item)=>`<div class="achievement-card ${achievements.has(item.id) ? 'complete' : ''}"><b>${achievements.has(item.id) ? '✦' : '◇'}</b><span><strong>${item.name}</strong><small>${item.text}</small></span><em>${achievements.has(item.id) ? '達成' : '未達成'}</em></div>`).join('')}</div></article><div class="meta-side"><article class="panel glass"><div class="panel-title"><h3>デイリー</h3><span>${profile.meta.daily.streak} DAY STREAK</span></div>${ensureDaily(profile).map((mission)=>`<div class="daily-mission ${mission.claimed ? 'claimed' : ''}"><div class="progress-label"><span>${mission.claimed ? '✓ ' : ''}${mission.text}</span><strong>${mission.progress}/${mission.target}</strong></div><div class="bar"><i style="width:${mission.progress / mission.target * 100}%"></i></div><small>${mission.claimed ? `受取済み +${mission.reward} GOLD` : `達成報酬 +${mission.reward} GOLD`}</small></div>`).join('')}</article><article class="panel glass bond-panel"><div class="panel-title"><h3>絆</h3><span>LV.${bond.level} / 10</span></div><div class="bond-level"><b>${bond.level >= 10 ? 'MAX' : `${bond.points} / ${bond.required}`}</b><span>累計 ${bond.total} PT</span></div><div class="bar"><i style="width:${bond.rate}%"></i></div><p class="screen-copy">毎日 +10、修練 +8、クエスト +12。正確率100%ならさらに +2。</p></article></div></div><article class="panel glass title-archive"><div class="panel-title"><h3>称号アーカイブ</h3><span>${ownedTitles.size} / ${TITLES.length}</span></div><div class="title-grid">${TITLES.map((title)=>`<button class="title-chip ${ownedTitles.has(title.id) ? 'owned' : 'locked'} ${equippedTitle.id === title.id ? 'equipped' : ''}" ${ownedTitles.has(title.id) ? `data-title="${title.id}"` : 'disabled'}><span>${ownedTitles.has(title.id) ? title.name : '未解放の称号'}</span><small>${ownedTitles.has(title.id) ? `${title.effectText} · ${title.text}` : '対応する実績を達成すると解放'}</small></button>`).join('')}</div></article>`;
  const activeContent = state.codexTab === 'drops' ? dropGrid : state.codexTab === 'weapons' ? weaponGrid : state.codexTab === 'companions' ? companionGrid : state.codexTab === 'missions' ? missionPanels : enemyGrid;
  const activeFound = state.codexTab === 'drops' ? dropFound : state.codexTab === 'weapons' ? weaponFound : state.codexTab === 'companions' ? rescuedCompanions.size : enemyFound;
  const activeTotal = state.codexTab === 'drops' ? enemyEntries.length : state.codexTab === 'weapons' ? WEAPONS.length : state.codexTab === 'companions' ? COMPANIONS.length : enemyEntries.length;
  const completion = state.codexTab === 'missions' ? Math.round(achievements.size / Math.max(1, ACHIEVEMENTS.length) * 100) : Math.round(activeFound / activeTotal * 100);

  return `<section class="screen"><div class="eyebrow">ARCHIVE CODEX</div><h1 class="screen-title">図鑑と記録</h1><p class="screen-copy">遭遇した存在、出現領域、固有ドロップを自動的にアーカイブへ記録します。</p><div class="codex-overview glass"><div><span>ARCHIVE COMPLETION</span><b>${completion}%</b></div><div class="bar"><i style="width:${completion}%"></i></div></div><div class="codex-tabs">${tabButton('enemies', '敵図鑑', `${enemyFound}/${enemyEntries.length}`)}${tabButton('drops', '戦利品', `${dropFound}/${enemyEntries.length}`)}${tabButton('weapons', '武器図鑑', `${weaponFound}/${WEAPONS.length}`)}${tabButton('companions', '仲間図鑑', `${rescuedCompanions.size}/${COMPANIONS.length}`)}${tabButton('missions', '実績・デイリー', `${achievements.size}/${ACHIEVEMENTS.length}`)}</div>${activeContent}</section>`;
}
function story() {
  const entries = storyArchive(profile);
  const unlocked = entries.filter((entry) => entry.unlocked).length;
  const seen = entries.filter((entry) => entry.seen).length;
  const selected = entries.find((entry) => entry.id === state.storyEntry && entry.unlocked) || null;
  const reader = selected ? `<article class="memory-reader glass"><div class="memory-reader-head"><div><span>${selected.label}</span><h2>${selected.title}</h2><small>${selected.chapter}</small></div><button class="memory-close" data-story-close aria-label="物語を閉じる">×</button></div><p class="memory-lead">${selected.text}</p>${selected.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}<div class="memory-signature">MEMORY RESTORED · ${String(entries.indexOf(selected) + 1).padStart(2, '0')}</div></article>` : '';
  const chapters = [...new Set(entries.map((entry) => entry.chapter))];
  const archive = chapters.map((chapter) => `<section class="memory-chapter"><div class="memory-chapter-heading"><span>${chapter}</span><i></i><small>${entries.filter((entry) => entry.chapter === chapter && entry.seen).length} / ${entries.filter((entry) => entry.chapter === chapter).length} READ</small></div><div class="memory-grid">${entries.map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.chapter === chapter).map(({ entry, index }) => `<article class="memory-card glass ${entry.unlocked ? 'unlocked' : 'locked'} ${entry.seen ? 'seen' : ''} ${selected?.id === entry.id ? 'selected' : ''}"><div class="memory-index">${String(index + 1).padStart(2, '0')}</div><div class="memory-card-copy"><span>${entry.unlocked ? entry.label : 'ARCHIVE LOCKED'}</span><h3>${entry.unlocked ? entry.title : '未復元の記憶'}</h3><p>${entry.unlocked ? entry.text : entry.unlockText}</p></div><button class="button ${entry.seen ? 'secondary' : 'primary'}" ${entry.unlocked ? `data-story="${entry.id}"` : 'disabled'}>${entry.unlocked ? entry.seen ? '再読' : '読む' : '未解放'}</button></article>`).join('')}</div></section>`).join('');
  return `<section class="screen memory-screen"><div class="eyebrow">MEMORY ARCHIVE · STORY V5</div><h1 class="screen-title">世界の記憶</h1><p class="screen-copy">三章・六つの世界・三王・創世神へ連なる記録。攻略状況に応じて物語が復元されます。</p><div class="memory-overview glass"><div><span>RESTORED</span><b>${unlocked} <small>/ ${entries.length}</small></b><p>解放済みの記憶</p></div><div><span>READ</span><b>${seen} <small>/ ${entries.length}</small></b><p>閲覧済みの記憶</p></div><div><span>PROGRESS</span><b>${Math.round(seen / Math.max(1, entries.length) * 100)}<small>%</small></b><p>記憶の収集率</p></div></div>${reader}<div class="memory-archive">${archive}</div></section>`;
}
function settings() {
  const rows = [['sfx','効果音','打鍵・ミス・剣撃・被弾・勝利に生成音を付けます。'],['bgm','BGM','画面と戦況に応じたオフライン対応の環境音楽を再生します。'],['keyboard','仮想キーボード','戦闘中にキーガイドを画面下へ表示します。'],['manualSupport','支援技の手動発動','条件達成後、同行枠1を Alt+1、同行枠2を Alt+2 または画面ボタンで発動します。'],['reducedMotion','低モーション','カメラ揺れ・パララックス・強い移動を軽減します。']];
  const notice = state.saveNotice ? `<div class="save-notice ${state.saveNotice.type}">${state.saveNotice.text}</div>` : '';
  const rpg = ensureRpg(profile);
  const progress = campaignProgress(profile);
  const typingKeys = Object.values(profile.chars || {}).filter((value) => (value.samples || 0) > 0).length;
  const typingSamples = Object.values(profile.chars || {}).reduce((sum, value) => sum + (value.samples || 0), 0);
  const enhanced = Object.values(rpg.weapons.plus || {}).reduce((sum, value) => sum + value, 0);
  const dropKinds = Object.values(profile.meta.codex?.drops || {}).filter((count) => count > 0).length;
  const saveIntegrity = `<div class="save-integrity-grid"><div><span>入力統計</span><b>${typingKeys} KEYS</b><small>${typingSamples.toLocaleString()} samples</small></div><div><span>装備</span><b>${rpg.weapons.owned.length} WEAPONS</b><small>強化合計 +${enhanced}</small></div><div><span>スキル</span><b>${rpg.skills.tree.length} / ${SKILLS.length}</b><small>習得状態を保存</small></div><div><span>世界修復</span><b>${progress.completed} / ${progress.total}</b><small>戦利品 ${dropKinds} / ${Object.keys(ENEMIES).length}</small></div></div>`;
  return `<section class="screen"><div class="eyebrow">SYSTEM SETTINGS</div><h1 class="screen-title">設定</h1><p class="screen-copy">快適さと読みやすさを、あなたの環境に合わせます。</p><div class="setting-list">${rows.map(([key,title,desc])=>`<article class="setting glass"><div><h3>${title}</h3><p>${desc}</p></div><button class="switch ${state.settings[key] ? 'on':''}" data-setting="${key}" role="switch" aria-checked="${state.settings[key]}"><i></i></button></article>`).join('')}</div><article class="panel glass save-panel"><div class="panel-title"><h3>セーブデータ</h3><span>SCHEMA V5 · INTEGRITY READY</span></div><p class="screen-copy">入力統計、装備、スキル、物語進行、戦利品を一つのセーブデータとして保存・復元します。読み込み時は必須項目と数値範囲を検証します。</p>${saveIntegrity}<div class="save-actions"><button class="button secondary" data-action="export-save">バックアップを書き出す</button><button class="button primary" data-action="import-save">バックアップを読み込む</button><input id="save-import" type="file" accept=".json,application/json" hidden></div>${notice}</article><article class="panel glass offline-panel"><div class="panel-title"><h3>オフライン状態</h3><span>${state.online ? 'NETWORK READY' : 'OFFLINE READY'}</span></div><div class="offline-status"><i class="${state.online ? 'online' : 'offline'}"></i><div><b>${state.online ? 'オンライン接続中' : 'オフラインで動作中'}</b><p>ゲーム本体・画像・セーブ機能はネット接続なしでも利用できます。</p></div></div></article></section>`;
}

function activateManualSupport(index) {
  if (!state.battle || state.victory || state.defeat || state.finisher || state.bossFinisher || state.battleIntro) return;
  const support = state.battle.activateSupport(index);
  if (!support) {
    toast('支援技はまだ発動条件を満たしていません。');
    return;
  }
  state.lastSupport = support;
  state.supportFxCycle += 1;
  state.lastDamage = support.damage || 0;
  state.attackFx = support.damage ? 'word' : 'hit';
  audio.cue(support.damage ? 'hit' : 'unlock');
  refreshPractice(`${support.name} 発動${support.damage ? `：${support.damage} DAMAGE` : support.heal ? `：HP +${support.heal}` : '。戦況を支援しました。'}`);
}

function startSession(mode, stageId = 1, campaignNodeId = null) {
  audio.cue('select');
  clearFinalShiftTimer();
  clearBossFinisherTimer();
  clearBattleIntroTimer();
  state.finisher = null;
  state.bossFinisher = null;
  state.battleIntro = null;
  const campaignNode = campaignNodeId ? campaignNodeById(campaignNodeId) : null;
  const selected = STAGES.find((stage) => stage.id === stageId);
  if (mode === 'BATTLE' && campaignNode && !campaignNodeIsUnlocked(profile, campaignNode.id)) {
    toast('前のクエストをクリアすると、この戦いが解放されます。');
    return;
  }
  if (mode === 'BATTLE' && !campaignNode && selected && !isStagePlayable(profile, selected)) {
    const data = ensureCompanions(profile);
    const message = stageId === 8
      ? 'センリンの三試練を完了すると最終決戦が解放されます。'
      : stageId === 7 && !data.brothersReconciled
        ? '他6人を救出し、ノクスとの兄弟編を完了すると仙境へ進めます。'
        : 'このクエストはまだ解放されていません。';
    toast(message);
    return;
  }
  const focus = mode === 'TRAINING' ? weakestChars(profile, 3) : null;
    state.selectedStage = stageId;
    state.selectedCampaignNode = campaignNode?.id || null;
    state.lastDamage = 0;
    state.lastSupport = null;
    state.supportFxCycle = 0;
    state.victory = null;
    state.defeat = false;
    state.battle = mode === 'BATTLE' ? new Battle(profile, stageId, campaignNode) : null;
    profile.meta.story.dialoguesSeen ??= [];
    const dialogueKey = campaignNode?.id || `stage-${stageId}`;
    const replay = profile.meta.story.dialoguesSeen.includes(dialogueKey);
    state.dialogue = mode === 'BATTLE' ? { ...stageDialogue(stageId, replay, campaignNode), stageId, sceneKey: dialogueKey, index: 0 } : null;
    if (state.battle) saveProfile(profile);
  state.session = new TypingSession(profile, mode, focus, state.battle?.typingPolicy() || null);
  location.hash = 'practice';
}

function syncBattleTypingPrompt() {
  if (state.battle && state.session?.mode === 'BATTLE') state.session.applyPolicy(state.battle.typingPolicy());
}

function clearFinalShiftTimer() {
  if (state.finisherTimer) clearTimeout(state.finisherTimer);
  state.finisherTimer = null;
}

function clearBossFinisherTimer() {
  if (state.bossFinisherTimer) clearTimeout(state.bossFinisherTimer);
  state.bossFinisherTimer = null;
}

function clearBattleIntroTimer() {
  if (state.battleIntroTimer) clearTimeout(state.battleIntroTimer);
  state.battleIntroTimer = null;
}

function specialBattleNode(node) {
  return Boolean(node && (node.kind === 'king' || node.kind === 'god' || (node.kind === 'quest' && node.questIndex === 5)));
}

function shouldBeginBattleIntro(advanced) {
  const node = state.selectedCampaignNode ? campaignNodeById(state.selectedCampaignNode) : null;
  if (!advanced?.nextWave || !state.battle || !specialBattleNode(node)) return false;
  if (node.kind === 'quest') return node.questIndex === 5 && state.battle.enemy?.tier === 'boss';
  if (node.kind === 'king') return state.battle.enemy?.tier === 'boss';
  // 神戦は第2フェーズ以降の創世神の再出現タイミングで対峙演出を挿入する。
  return node.kind === 'god' && state.battle.waveIndex > 0;
}

function maybeBeginBattleIntro(advanced) {
  if (!shouldBeginBattleIntro(advanced)) return false;
  beginBattleIntro();
  return true;
}

function beginBattleIntro() {
  const node = state.selectedCampaignNode ? campaignNodeById(state.selectedCampaignNode) : null;
  if (!state.battle || !specialBattleNode(node)) return;
  clearBattleIntroTimer();
  const kind = node.kind === 'god' ? 'god' : node.kind === 'king' ? 'king' : 'boss';
  const sequence = [
    ['arrival', 'battle-intro-arrival', 680],
    ['standoff', 'battle-intro-standoff', 980],
    ['ready', 'battle-intro-ready', 720],
  ];
  state.battleIntro = { kind, phase: sequence[0][0] };
  state.attackFx = sequence[0][1];
  audio.cue('boss-intro');
  refreshPractice(battleIntroPresentation().copy);
  let index = 1;
  const advance = () => {
    if (!state.battleIntro) return;
    if (index >= sequence.length) {
      state.battleIntro = null;
      state.battleIntroTimer = null;
      state.attackFx = 'idle';
      audio.cue('ready');
      refreshPractice('戦闘開始。文字を入力して攻撃してください。');
      return;
    }
    const [phase, attackFx, delay] = sequence[index];
    state.battleIntro.phase = phase;
    state.attackFx = attackFx;
    if (phase === 'standoff') audio.cue('standoff');
    refreshPractice(battleIntroPresentation().copy);
    index += 1;
    state.battleIntroTimer = setTimeout(advance, delay);
  };
  state.battleIntroTimer = setTimeout(advance, sequence[0][2]);
}

function beginSovereignBreak(damage = 0, node) {
  const chapter = CAMPAIGN_CHAPTERS.find((item) => item.id === node?.chapterId);
  const chapterTitle = chapter ? `CHAPTER ${chapter.no} · ${chapter.title}` : 'CHAPTER COMPLETE';
  const sequence = [
    ['law-stop', 'sovereign-law-stop', '王の法則干渉を停止。王権核を固定します。', 520],
    ['allies', 'sovereign-allies', '同章で救出した二人の文字力を連結。', 680],
    ['crown', 'sovereign-crown', '王冠ルーンを破砕。王権結界が崩壊します。', 760],
    ['strike', 'sovereign-strike', 'SOVEREIGN BREAK — 王権核を断つ。', 900],
    ['chapter', 'sovereign-chapter', `${chapterTitle} を修復しました。`, 900],
  ];
  clearBossFinisherTimer();
  state.lastDamage = damage;
  state.lastSupport = null;
  state.bossFinisher = { kind: 'sovereign', phase: sequence[0][0], chapterTitle };
  state.attackFx = sequence[0][1];
  refreshPractice(sequence[0][2]);
  let index = 1;
  const advance = () => {
    if (!state.bossFinisher || state.bossFinisher.kind !== 'sovereign') return;
    if (index >= sequence.length) {
      state.bossFinisher = null;
      state.bossFinisherTimer = null;
      state.victory = { stageCleared: true, sovereignBreak: true, chapterComplete: chapterTitle };
      state.attackFx = 'victory';
      audio.cue('victory');
      refreshPractice('章の修復完了。ENTERで結果へ。');
      return;
    }
    const [phase, attackFx, message, delay] = sequence[index];
    state.bossFinisher.phase = phase;
    state.attackFx = attackFx;
    if (phase === 'allies' && chapter) state.lastSupport = { name: chapter.stages.map((item) => item.companion).join(' × ') };
    if (phase === 'strike') audio.cue('slash');
    refreshPractice(message);
    index += 1;
    state.bossFinisherTimer = setTimeout(advance, bossFinisherDelay(delay));
  };
  state.bossFinisherTimer = setTimeout(advance, bossFinisherDelay(sequence[0][3]));
}

function beginBossFinisher(damage = 0) {
  const node = state.selectedCampaignNode ? campaignNodeById(state.selectedCampaignNode) : null;
  if (node?.kind === 'king') {
    beginSovereignBreak(damage, node);
    return;
  }
  clearBossFinisherTimer();
  clearBattleIntroTimer();
  state.bossFinisher = { kind: 'boss', phase: 'ready' };
  state.lastDamage = damage;
  state.lastSupport = null;
  state.attackFx = 'boss-finisher-ready';
  refreshPractice('最後の敵が崩れ始めた。決着の一撃へ移行します。');
  state.bossFinisherTimer = setTimeout(() => {
    if (!state.bossFinisher) return;
    state.bossFinisher.phase = 'strike';
    state.attackFx = 'boss-finisher-strike';
    audio.cue('slash');
    refreshPractice('FINISHING SHIFT — 決着の剣閃。');
    state.bossFinisherTimer = setTimeout(() => {
      if (!state.bossFinisher) return;
      state.bossFinisher.phase = 'dissolve';
      state.attackFx = 'boss-finisher-dissolve';
      refreshPractice('敵性文字列の消滅を確認。');
      state.bossFinisherTimer = setTimeout(() => {
        if (!state.bossFinisher) return;
        state.bossFinisher = null;
        state.bossFinisherTimer = null;
        state.victory = { stageCleared: true };
        state.attackFx = 'victory';
        audio.cue('victory');
        refreshPractice('クエストクリア。ENTERで結果へ。');
      }, bossFinisherDelay(620));
    }, bossFinisherDelay(760));
  }, bossFinisherDelay(260));
}

function isFinalShiftResult(result) {
  return Boolean(
    result?.enemyDefeated
    && result?.stageCleared
    && state.battle?.stage.id === 8
    && state.battle?.enemy?.id === 'nullking',
  );
}

function isOriginShiftResult(result) {
  return Boolean(
    result?.enemyDefeated
    && result?.stageCleared
    && state.battle?.campaignNode?.kind === 'god',
  );
}

function beginOriginShift(damage = 0) {
  clearFinalShiftTimer();
  clearBossFinisherTimer();
  state.bossFinisher = null;
  state.finisher = {
    kind: 'origin',
    word: ORIGIN_SHIFT_WORD,
    index: 0,
    phase: 'ready',
  };
  state.lastDamage = damage;
  state.lastSupport = { name: 'SIX ALLIES LIGATURE' };
  state.attackFx = 'origin-ready';
  refreshPractice('六人の仲間が創世核を露出させた。最後の文字列を準備してください。');
  state.finisherTimer = setTimeout(() => {
    if (!state.finisher || state.finisher.kind !== 'origin' || state.finisher.phase !== 'ready') return;
    state.finisher.phase = 'typing';
    state.attackFx = 'origin-type';
    refreshPractice('WRITE THE WORLD を入力して、世界の未来を選べ。');
  }, 420);
}

function beginFinalShift(damage = 0) {
  clearFinalShiftTimer();
  clearBossFinisherTimer();
  state.bossFinisher = null;
  state.finisher = {
    word: FINAL_SHIFT_WORD,
    index: 0,
    phase: 'ready',
  };
  state.lastDamage = damage;
  state.lastSupport = null;
  state.attackFx = 'finisher-ready';
  refreshPractice('最終文字核が露出しました。終端文字列を準備してください。');
  state.finisherTimer = setTimeout(() => {
    if (!state.finisher || state.finisher.phase !== 'ready') return;
    state.finisher.phase = 'typing';
    state.attackFx = 'finisher-type';
    refreshPractice('REWRITE を入力して最後の一撃を放て。');
  }, 240);
}

function completeFinalShift() {
  clearFinalShiftTimer();
  if (!state.finisher) return;
  if (state.finisher.kind === 'origin') {
    state.finisher.phase = 'cinematic';
    state.attackFx = 'origin-strike';
    audio.cue('burst');
    refreshPractice('ORIGIN SHIFT — 六つの文字力で創世核を貫く。');
    state.finisherTimer = setTimeout(() => {
      if (!state.finisher || state.finisher.kind !== 'origin' || state.finisher.phase !== 'cinematic') return;
      state.finisher.phase = 'restored';
      state.attackFx = 'origin-restored';
      audio.cue('unlock');
      refreshPractice('WORLD REWRITTEN — 世界の因果を再構成しました。');
      state.finisherTimer = setTimeout(() => {
        if (!state.finisher || state.finisher.kind !== 'origin' || state.finisher.phase !== 'restored') return;
        state.finisher = null;
        state.finisherTimer = null;
        state.victory = { stageCleared: true, originShift: true };
        state.attackFx = 'victory';
        audio.cue('victory');
        refreshPractice('神への挑戦を制覇。ENTERでエンディングへ。');
      }, 900);
    }, 1500);
    return;
  }
  state.finisher.phase = 'cinematic';
  state.attackFx = 'finisher-strike';
  audio.cue('slash');
  refreshPractice('TERMINAL SLASH — 終端文字列を書き換えています。');
  state.finisherTimer = setTimeout(() => {
    if (!state.finisher || state.finisher.phase !== 'cinematic') return;
    state.finisher.phase = 'restored';
    state.attackFx = 'finisher-restored';
    audio.cue('unlock');
    refreshPractice('RESTORATION COMPLETE — 文字核の修復に成功しました。');
    state.finisherTimer = setTimeout(() => {
      if (!state.finisher || state.finisher.phase !== 'restored') return;
      state.finisher = null;
      state.finisherTimer = null;
      state.victory = { stageCleared: true, finalShift: true };
      state.attackFx = 'victory';
      audio.cue('victory');
      refreshPractice('クエストクリア。ENTERで結果へ。');
    }, 560);
  }, 1080);
}

function handleFinalShiftInput(event) {
  if (!state.finisher) return false;
  event.preventDefault();
  if (state.finisher.phase !== 'typing') return true;
  if (event.key.length !== 1) return true;
  const expected = state.finisher.word[state.finisher.index];
  if (event.key.toLowerCase() !== expected) {
    state.attackFx = 'finisher-miss';
    refreshPractice(`「${expected.toUpperCase()}」を入力してください。`);
    return true;
  }
  state.finisher.index += 1;
  state.attackFx = 'finisher-type';
  audio.cue('hit');
  if (state.finisher.index >= state.finisher.word.length) {
    completeFinalShift();
  } else {
    refreshPractice('終端文字列を入力中。');
  }
  return true;
}

function refreshPractice(feedback = '') {
  const session = state.session;
  if (!session) return;
  const phrase = document.querySelector('#typing-phrase');
  if (phrase) phrase.innerHTML = state.finisher ? renderFinalShiftPhrase() : renderPhrase(session);
  const currentIndex = state.finisher?.index ?? session.index;
  const currentLength = state.finisher?.word.length ?? session.text.length;
  const defaultFeedback = state.finisher ? (state.finisher.kind === 'origin' ? 'WRITE THE WORLD を入力して未来を選べ' : 'REWRITE を入力して終端を断て') : '入力を続けてください';
  const metrics = { '#metric-wpm': session.wpm, '#metric-acc': `${session.accuracy}%`, '#metric-combo': session.combo, '#metric-best': session.maxCombo, '#typing-progress': `${currentIndex} / ${currentLength}`, '#typing-feedback': feedback || defaultFeedback };
  Object.entries(metrics).forEach(([selector, value]) => { const element = document.querySelector(selector); if (element) element.textContent = value; });
    const keyboard = document.querySelector('.typing-keyboard');
    if (keyboard) keyboard.outerHTML = renderKeyboard(session);
    // 戦闘パネルを作り直すと、ブラウザによっては古いHP表示が残る。
    // そのため、表示中の要素を直接更新する。
    const battlePanel = document.querySelector('#battle-panel');
    if (battlePanel && state.battle) {
      const battle = state.battle;
      const enemy = battle.enemy;
      const finisherHoldsCore = state.bossFinisher && state.bossFinisher.phase !== 'dissolve';
      const visibleEnemyHp = finisherHoldsCore ? Math.max(1, enemy.hp) : enemy.hp;
      const enemyRate = Math.max(0, visibleEnemyHp / enemy.maxHp * 100);
      const playerRate = Math.max(0, battle.playerHp / battle.playerMaxHp * 100);
      const originClass = battle.campaignNode?.kind === 'god' ? `origin-battle origin-phase-${enemy.godPhase}` : '';
      const supportClass = state.lastSupport ? `support-fx support-${state.lastSupport.id || 'generic'} support-cycle-${state.supportFxCycle % 2}` : '';
      battlePanel.className = `battle-panel battle-art glass ${state.attackFx || 'idle'} fx-cycle-${state.attackFxCycle % 2} ${supportClass} stage-${battle.stage.id} ${battle.campaignNode?.kind === 'king' ? 'sovereign-battle' : ''} ${originClass} ${state.battleIntro ? `battle-intro-${state.battleIntro.phase}` : ''}`;
      battlePanel.style.setProperty('--enemy', enemy.color);
      battlePanel.style.setProperty('--stage-color', (STAGE_ART[battle.stage.id] || STAGE_ART[1]).color);
      battlePanel.style.setProperty('--damage', (1 - enemyRate / 100).toFixed(2));
      const enemyCanvas = battlePanel.querySelector('#battle-enemy-canvas');
      const renderedEnemy = enemyCanvas?.querySelector('[data-enemy-id]')?.getAttribute('data-enemy-id');
      if (enemyCanvas && renderedEnemy !== enemy.id) {
        enemyCanvas.setAttribute('style', enemyBattleStyle(enemy.id, enemy));
        enemyCanvas.innerHTML = enemyArt(enemy.id, enemy, { battle: true });
      }
      const values = {
        '#battle-enemy-name': enemy.name,
        '#battle-enemy-hp': `${visibleEnemyHp} / ${enemy.maxHp}`,
        '#battle-enemy-meta': `${enemy.tier.toUpperCase()} · ${enemy.element.toUpperCase()} · ${battle.elementState.label} · WEAK ${battle.weakChar?.toUpperCase() || '—'}`,
        '#battle-enemy-trait': enemy.traitText,
        '#battle-player-hp': `${battle.playerHp} / ${battle.playerMaxHp}`,
        '#battle-wave': `${battle.campaignNode?.kind === 'god' ? 'PHASE' : 'WAVE'} ${battle.waveIndex + 1} / ${battle.stage.waves.length}`,
        '#battle-burst': `BURST ${battle.burst}% · TAB`,
        '#battle-attack-value': `${Math.round(battle.attackGauge)}%`,
        '#battle-readout': state.lastDamage ? `HIT  -${state.lastDamage} DAMAGE` : '',
        '#battle-damage-pop': state.lastDamage ? `-${state.lastDamage}` : '',
        '#battle-support-text': state.lastSupport ? `${state.lastSupport.name}${state.lastSupport.damage ? ` / +${state.lastSupport.damage}` : ''}${state.lastSupport.heal ? ` / HP +${state.lastSupport.heal}` : ''}${state.lastSupport.burst ? ` / BURST +${state.lastSupport.burst}` : ''}` : battle.manualSupport ? 'SUPPORT CHARGE · ALT+1 / ALT+2' : 'SUPPORT AUTO',
        '#origin-phase-label': `DIVINE PHASE ${enemy.godPhase || battle.waveIndex + 1} / 4`,
        '#origin-phase-name': enemy.phaseName || '創造',
        '#origin-phase-copy': enemy.godPhase === 4 ? 'SIX ALLIES CONNECTED' : 'ALPHA ORIGIN IS REWRITING REALITY',
      };
      Object.entries(values).forEach(([selector, value]) => {
        const element = battlePanel.querySelector(selector) || document.querySelector(selector);
        if (element) element.textContent = value;
      });
      const burstLabel = battlePanel.querySelector('#battle-burst');
      if (burstLabel) burstLabel.textContent = `BURST ${battle.burst}%`;
      const actionCue = battlePanel.querySelector('#battle-action-cue');
      if (actionCue) actionCue.textContent = battleActionCue();
      const enemyFill = battlePanel.querySelector('#battle-enemy-fill');
      if (enemyFill) enemyFill.style.width = `${enemyRate}%`;
      const playerFill = battlePanel.querySelector('#battle-player-fill');
      if (playerFill) playerFill.style.width = `${playerRate}%`;
      const attackFill = battlePanel.querySelector('#battle-attack-fill');
      if (attackFill) attackFill.style.width = `${battle.attackGauge}%`;
      const burstFill = battlePanel.querySelector('#battle-burst-fill');
      if (burstFill) burstFill.style.width = `${battle.burst}%`;
      const waveFill = battlePanel.querySelector('#battle-wave-fill');
      if (waveFill) waveFill.style.width = `${(battle.waveIndex + 1) / battle.stage.waves.length * 100}%`;
      battle.supportSlots().forEach((item) => {
        const slot = document.querySelector(`[data-support-slot="${item.index}"]`);
        if (!slot) return;
        slot.classList.toggle('ready', item.ready);
        slot.disabled = !battle.manualSupport || !item.ready;
        const statusText = battle.manualSupport ? (item.ready ? `ALT+${item.index + 1} READY` : `ALT+${item.index + 1} CHARGING`) : 'AUTO SUPPORT';
        const status = slot.querySelector('.battle-support-state');
        if (status) status.textContent = statusText;
        slot.setAttribute('aria-label', `${item.name}の支援技 ${statusText}`);
      });
      const siblingFill = document.querySelector('#battle-sibling-fill');
      if (siblingFill) siblingFill.style.width = `${battle.companionData.siblingGauge}%`;
      const siblingValue = document.querySelector('#battle-sibling-value');
      if (siblingValue) siblingValue.textContent = battle.ligatureActive ? 'LINK ACTIVE' : battle.ligatureReady ? 'NEXT WORD' : `${battle.companionData.siblingGauge}%`;
      const siblingLink = document.querySelector('.battle-sibling-link');
      if (siblingLink) siblingLink.className = `battle-sibling-link glass ${battle.ligatureReady ? 'ready' : ''} ${battle.ligatureActive ? 'active' : ''}`;
      const damagePop = battlePanel.querySelector('#battle-damage-pop');
      if (damagePop) damagePop.hidden = !state.lastDamage;
      if (['hit', 'word', 'burst'].includes(state.attackFx)) {
        clearTimeout(state.attackResetTimer);
        const attackCycle = state.attackFxCycle;
        const resetDelay = state.attackFx === 'hit' ? 430 : 590;
        state.attackResetTimer = setTimeout(() => {
          if (!state.battle || state.attackFxCycle !== attackCycle || !['hit', 'word', 'burst'].includes(state.attackFx)) return;
          state.attackFx = 'idle';
          const currentPanel = document.querySelector('#battle-panel');
          if (currentPanel) {
            const originClassNow = state.battle.campaignNode?.kind === 'god' ? `origin-battle origin-phase-${state.battle.enemy.godPhase}` : '';
            const supportClassNow = state.lastSupport ? `support-fx support-${state.lastSupport.id || 'generic'} support-cycle-${state.supportFxCycle % 2}` : '';
            currentPanel.className = `battle-panel battle-art glass idle fx-cycle-${state.attackFxCycle % 2} ${supportClassNow} stage-${state.battle.stage.id} ${state.battle.campaignNode?.kind === 'king' ? 'sovereign-battle' : ''} ${originClassNow}`;
          }
          const actionCueNow = document.querySelector('#battle-action-cue');
          if (actionCueNow) actionCueNow.textContent = battleActionCue();
        }, resetDelay);
      }
      const finalShift = battlePanel.querySelector('#battle-final-shift');
      if (finalShift) {
        const presentation = finalShiftPresentation();
        finalShift.hidden = !state.finisher;
        finalShift.className = `battle-final-shift ${state.finisher?.phase || ''}`;
        const title = finalShift.querySelector('#battle-final-title');
        const copy = finalShift.querySelector('#battle-final-copy');
        if (title) title.textContent = presentation.title;
        if (copy) copy.textContent = presentation.copy;
      }
      const bossFinisher = battlePanel.querySelector('#battle-boss-finisher');
      if (bossFinisher) {
        bossFinisher.hidden = !state.bossFinisher;
        bossFinisher.className = `battle-boss-finisher ${state.bossFinisher?.kind || ''} ${state.bossFinisher?.phase || ''}`;
        const presentation = bossFinisherPresentation();
        const label = bossFinisher.querySelector('#battle-boss-finisher-label');
        const title = bossFinisher.querySelector('#battle-boss-finisher-title');
        const copy = bossFinisher.querySelector('#battle-boss-finisher-copy');
        if (label) label.textContent = presentation.label;
        if (title) title.textContent = presentation.title;
        if (copy) copy.textContent = presentation.copy;
      }
      const battleIntro = battlePanel.querySelector('#battle-intro');
      if (battleIntro) {
        const intro = battleIntroPresentation();
        battleIntro.hidden = !state.battleIntro;
        battleIntro.className = `battle-intro ${state.battleIntro?.kind || ''} ${state.battleIntro?.phase || ''}`;
        const label = battleIntro.querySelector('#battle-intro-label');
        const title = battleIntro.querySelector('#battle-intro-title');
        const copy = battleIntro.querySelector('#battle-intro-copy');
        if (label) label.textContent = intro.label;
        if (title) title.textContent = intro.title;
        if (copy) copy.textContent = intro.copy;
      }
      const typingStage = document.querySelector('.typing-stage');
      if (typingStage) typingStage.classList.toggle('finisher-mode', Boolean(state.finisher));
      const victory = battlePanel.querySelector('#battle-victory');
      if (victory) {
        victory.hidden = !state.victory;
        if (state.victory) {
          const next = victory.querySelector('[data-victory-next]');
          if (next) next.textContent = state.victory.stageCleared ? 'ENTER で結果へ' : 'ENTER で次の敵へ';
        }
      }
      const defeat = battlePanel.querySelector('#battle-defeat');
      if (defeat) defeat.hidden = !state.defeat;
    }
}

function finishSession() {
  const session = state.session;
  if (!session) return;
  clearFinalShiftTimer();
  clearBossFinisherTimer();
  clearBattleIntroTimer();
  state.finisher = null;
  state.bossFinisher = null;
  state.battleIntro = null;
  clearInterval(state.timer);
  clearInterval(state.enemyTimer);
  state.timer = null;
  state.enemyTimer = null;
  if (!session.hits) { state.session = null; location.hash = 'home'; return; }
  const resultData = session.result();
    const clearedBattle = state.battle && state.battle.waveIndex >= state.battle.stage.waves.length;
    if (clearedBattle) {
      const battle = state.battle;
      const hpRate = battle.playerHp / battle.playerMaxHp;
      const stars = hpRate >= .8 ? 3 : hpRate >= .4 ? 2 : 1;
      const companionBond = applyCompanionBattleBond(profile, resultData, battle.companions.map((item) => item.id));
      const campaignNode = state.selectedCampaignNode ? campaignNodeById(state.selectedCampaignNode) : null;
      let rescue = { rescued: null, blocked: false };
      let rescueEvaluation = { passed: true, conditions: [], reason: '' };
      if (campaignNode) {
        const update = completeCampaignNode(profile, campaignNode.id, stars);
        const companionData = ensureCompanions(profile);
        if (campaignNode.kind === 'quest' && campaignNode.stageId === 6) {
          if (campaignNode.questIndex === 1) companionData.senrinTrials.still = true;
          if (campaignNode.questIndex === 2) companionData.senrinTrials.flow = true;
          if (campaignNode.questIndex === 3) companionData.senrinTrials.insight = true;
        }
        if (campaignNode.kind === 'quest' && campaignNode.questIndex === 5) {
          const previous = profile.rpg.quest.cleared[battle.stage.id]?.stars || 0;
          profile.rpg.quest.cleared[battle.stage.id] = { stars: Math.max(previous, stars), clearedAt: Date.now() };
          profile.rpg.quest.unlockedStage = Math.max(profile.rpg.quest.unlockedStage || 1, Math.min(STAGES.length, battle.stage.id + 1));
          const rescueTarget = rescuePreview(battle.stage.id);
          const needsRescue = rescueTarget && !companionData.rescued.includes(rescueTarget.id);
          rescueEvaluation = needsRescue ? {
            passed: true,
            conditions: [{ label: 'ステージ決戦', passed: true, current: 'クリア', target: `QUEST ${battle.stage.id}-5` }],
            reason: '',
          } : rescueEvaluation;
          rescue = grantRescueForStage(profile, battle.stage.id, stars, rescueEvaluation);
          profile.rpg.lifetime.bossKills += 1;
        } else if (campaignNode.kind === 'king' || campaignNode.kind === 'god') {
          profile.rpg.lifetime.bossKills += 1;
          if (campaignNode.kind === 'king') {
            const completedChapter = CAMPAIGN_CHAPTERS.find((item) => item.id === campaignNode.chapterId);
            resultData.chapterComplete = completedChapter ? `CHAPTER ${completedChapter.no} · ${completedChapter.title}` : campaignNode.title;
          } else {
            resultData.originShift = true;
            resultData.ending = 'WRITE THE WORLD';
            profile.meta.story.flags.originShiftComplete = true;
          }
        }
        profile.meta.story.flags ??= {};
        profile.meta.story.flags.noxIdentityRevealed ||= Boolean(rescue.rescued?.id === 'nox' || ensureCompanions(profile).noxRevealed);
        profile.meta.story.flags.brothersReconciled = ensureCompanions(profile).brothersReconciled;
        profile.meta.story.flags.finalChapterUnlocked = ensureCompanions(profile).finalUnlocked;
        resultData.stage = campaignNode.kind === 'quest' ? `${campaignNode.stage.name} / ${campaignNode.title}` : campaignNode.title;
        resultData.nextStage = update.next?.title || null;
        resultData.nextNodeId = update.next?.id || null;
        resultData.campaignNode = campaignNode.id;
        resultData.campaignKind = campaignNode.kind;
      } else {
        const previous = profile.rpg.quest.cleared[battle.stage.id]?.stars || 0;
        profile.rpg.quest.cleared[battle.stage.id] = { stars: Math.max(previous, stars), clearedAt: Date.now() };
        const rescueTarget = rescuePreview(battle.stage.id);
        const needsRescue = rescueTarget && !ensureCompanions(profile).rescued.includes(rescueTarget.id);
        rescueEvaluation = needsRescue ? evaluateRescueTrial(profile, battle.stage.id, resultData, battle) : rescueEvaluation;
        rescue = grantRescueForStage(profile, battle.stage.id, stars, rescueEvaluation);
        const rescueComplete = !rescueTarget || ensureCompanions(profile).rescued.includes(rescueTarget.id);
        if (rescueComplete && battle.stage.id < STAGES.length) {
          profile.rpg.quest.unlockedStage = Math.max(profile.rpg.quest.unlockedStage || 1, Math.min(STAGES.length, battle.stage.id + 1));
        }
        if (companionBond.reconciled) profile.rpg.quest.unlockedStage = Math.max(profile.rpg.quest.unlockedStage || 1, STAGES.length);
        profile.meta.story.flags ??= {};
        profile.meta.story.flags.noxIdentityRevealed ||= Boolean(rescue.rescued?.id === 'nox' || ensureCompanions(profile).noxRevealed);
        profile.meta.story.flags.brothersReconciled = ensureCompanions(profile).brothersReconciled;
        profile.meta.story.flags.finalChapterUnlocked = ensureCompanions(profile).finalUnlocked;
        profile.rpg.lifetime.bossKills += 1;
        resultData.stage = battle.stage.name;
        resultData.nextStage = STAGES.find((stage) => stage.id === battle.stage.id + 1 && isStagePlayable(profile, stage))?.name || null;
      }
      resultData.gold = battle.rewards.gold;
      resultData.xp = battle.rewards.xp;
      profile.rpg.materials ??= { kotonoha: 0, shard: 0 };
      const kotonoha = battle.rewards.kotonoha;
      const shard = battle.rewards.shard;
      resultData.stars = stars;
      resultData.materials = { kotonoha, shard };
      resultData.drops = battle.rewards.drops.map((drop) => ({ ...drop }));
      resultData.rescue = rescue.rescued ? rescue.rescued.name : null;
      resultData.rescueId = rescue.rescued?.id || null;
      resultData.rescueBlocked = rescue.blocked ? rescue.reason : null;
      resultData.rescueConditions = rescueEvaluation.conditions || [];
      resultData.companionBond = companionBond;
    }
    // 戦闘報酬は撃破したWaveごとに保存済み。修練場報酬のみ終了時に加算する。
    if (!clearedBattle) {
      profile.rpg.gold += resultData.gold;
      profile.rpg.xp += resultData.xp;
    }
  let leveled = false;
  let levelsGained = 0;
  while (profile.rpg.xp >= profile.rpg.level * 120) { profile.rpg.xp -= profile.rpg.level * 120; profile.rpg.level += 1; profile.rpg.sp += 1; leveled = true; levelsGained += 1; }
  resultData.levelsGained = levelsGained;
  profile.rpg.lifetime.playMs += resultData.playMs;
    if (!state.battle) { profile.history.unshift({ t: Date.now(), ...resultData }); profile.history = profile.history.slice(0, 500); }
  const metaResult = applySessionMeta(profile, resultData);
  resultData.meta = metaResult;
  const unlocked = checkUnlock(profile);
  saveProfile(profile);
  state.lastResult = resultData;
    state.session = null;
    state.battle = null;
  location.hash = 'result';
  if (unlocked) setTimeout(() => toast(unlocked), 250);
  if (metaResult.achievements.length) setTimeout(() => toast(`実績解除: ${metaResult.achievements.join(' / ')}`), 800);
  if (metaResult.titles.length) setTimeout(() => toast(`称号獲得: ${metaResult.titles.join(' / ')}`), 1100);
  if (leveled) setTimeout(() => toast(`LEVEL UP: Lv.${profile.rpg.level} / SP +1`), 1350);
}

function advanceResult() {
  const result = state.lastResult;
  if (!result || result.mode !== 'BATTLE') return;
  const next = result.nextNodeId ? campaignNodeById(result.nextNodeId) : null;
  if (next && campaignNodeIsUnlocked(profile, next.id)) {
    startSession('BATTLE', next.battleStageId, next.id);
    return;
  }
  state.lastResult = null;
  location.hash = 'quest';
}

  function activateTyping() {
    const session = state.session;
    if (!session) return;
    const typingStage = document.querySelector('.typing-stage');
    if (typingStage) {
      typingStage.tabIndex = 0;
      typingStage.focus({ preventScroll: true });
      typingStage.addEventListener('compositionstart', () => refreshPractice('英数入力モードに切り替えてください。'));
    }
  const startedAt = performance.now();
  if (state.battle) {
    let lastEnemyTick = performance.now();
    state.enemyTimer = setInterval(() => {
      if (!state.battle || state.victory || state.defeat || state.finisher || state.bossFinisher || state.battleIntro) {
        lastEnemyTick = performance.now();
        return;
      }
      const now = performance.now();
      const retaliation = state.battle.tick((now - lastEnemyTick) / 1000);
      lastEnemyTick = now;
      const attackFill = document.querySelector('#battle-attack-fill');
      const attackValue = document.querySelector('#battle-attack-value');
      if (attackFill) attackFill.style.width = `${state.battle.attackGauge}%`;
      if (attackValue) attackValue.textContent = `${Math.round(state.battle.attackGauge)}%`;
      if (!retaliation.attacked) return;
      state.lastDamage = 0;
      state.lastSupport = null;
      state.attackFx = 'enemy-attack';
      if (retaliation.defeated) {
        state.defeat = true;
        state.attackFx = 'defeat';
        audio.cue('defeat');
        refreshPractice(`敵の攻撃で ${retaliation.damage} ダメージ。シフターは力尽きた。`);
        saveProfile(profile);
        return;
      }
      const healText = retaliation.healed ? ` / 敵HP +${retaliation.healed}` : '';
      refreshPractice(`敵の攻撃：${retaliation.damage} ダメージ${healText}`);
      setTimeout(() => {
        if (!state.defeat && !state.victory) {
          state.attackFx = 'idle';
          const panel = document.querySelector('#battle-panel');
          if (panel) {
            const originClass = state.battle.campaignNode?.kind === 'god' ? `origin-battle origin-phase-${state.battle.enemy.godPhase}` : '';
            panel.className = `battle-panel battle-art glass idle stage-${state.battle.stage.id} ${state.battle.campaignNode?.kind === 'king' ? 'sovereign-battle' : ''} ${originClass}`;
          }
        }
      }, 320);
    }, 100);
  }
  window.onkeydown = (event) => {
    if (event.isComposing || event.ctrlKey || event.metaKey) return;
    if (state.finisher && handleFinalShiftInput(event)) return;
    if (state.bossFinisher) {
      event.preventDefault();
      return;
    }
    if (state.battleIntro) {
      event.preventDefault();
      return;
    }
    if (event.altKey && state.battle && (event.key === '1' || event.key === '2')) {
      event.preventDefault();
      activateManualSupport(Number(event.key) - 1);
      return;
    }
    if (event.altKey) return;
    if (state.defeat) {
      if (event.key === 'Enter') {
        event.preventDefault();
        clearFinalShiftTimer();
        clearBossFinisherTimer();
        clearBattleIntroTimer();
        state.finisher = null;
        state.bossFinisher = null;
        state.battleIntro = null;
        state.battle = new Battle(profile, state.selectedStage, state.selectedCampaignNode ? campaignNodeById(state.selectedCampaignNode) : null);
        state.session = new TypingSession(profile, 'BATTLE', null, state.battle.typingPolicy());
        saveProfile(profile);
        state.defeat = false;
        state.lastDamage = 0;
        state.lastSupport = null;
        state.attackFx = 'idle';
        render();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        clearFinalShiftTimer();
        clearBossFinisherTimer();
        clearBattleIntroTimer();
        state.finisher = null;
        state.bossFinisher = null;
        state.battleIntro = null;
        state.session = null;
        state.battle = null;
        state.defeat = false;
        location.hash = 'quest';
      }
      return;
    }
      if (event.key === 'Escape') { clearFinalShiftTimer(); clearBossFinisherTimer(); clearBattleIntroTimer(); state.finisher = null; state.bossFinisher = null; state.battleIntro = null; state.victory = null; state.defeat = false; if (session.mode === 'BATTLE') { state.battle = new Battle(profile, state.selectedStage, state.selectedCampaignNode ? campaignNodeById(state.selectedCampaignNode) : null); state.session = new TypingSession(profile, session.mode, session.focusChars, state.battle.typingPolicy()); saveProfile(profile); } else { state.session = new TypingSession(profile, session.mode, session.focusChars); } render(); return; }
    if (state.victory) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const victory = state.victory;
        const advanced = state.battle.advanceWave();
        syncBattleTypingPrompt();
        saveProfile(profile);
        state.victory = null;
        state.lastDamage = 0;
        state.lastSupport = null;
        state.attackFx = 'idle';
        if (victory.stageCleared) { finishSession(); return; }
        if (!maybeBeginBattleIntro(advanced)) refreshPractice(advanced.chain ? 'ツインズの分身が出現した。' : '次の敵が出現した。');
      }
      return;
    }
    if (event.key === 'Tab' && state.battle) {
      event.preventDefault();
      const burst = state.battle.useBurst();
      if (burst) audio.cue('burst');
      if (burst) {
        state.lastDamage = burst.damage || 0;
        state.lastSupport = null;
        state.attackFx = 'burst';
        state.attackFxCycle += 1;
      }
      if (isOriginShiftResult(burst)) {
        beginOriginShift(burst.damage || 0);
      } else if (isFinalShiftResult(burst)) {
        beginFinalShift(burst.damage || 0);
      } else if (burst?.enemyDefeated && burst.stageCleared) {
        beginBossFinisher(burst.damage || 0);
      } else if (burst?.enemyDefeated) {
        const advanced = state.battle.advanceWave();
        syncBattleTypingPrompt();
        saveProfile(profile);
        state.lastDamage = 0;
        state.lastSupport = null;
        state.attackFx = 'idle';
        if (!maybeBeginBattleIntro(advanced)) refreshPractice(advanced.chain ? '連鎖発動。ツインズの分身が出現した。' : '敵を撃破。次の敵が出現した。');
      } else if (burst) refreshPractice(`BURST: ${burst.damage} DAMAGE`);
      return;
    }
    if (event.key.length !== 1) return;
    event.preventDefault();
      const action = state.session.input(event.key);
      state.attackFx = action.state === 'miss' ? 'miss' : action.wordEnded ? 'word' : 'hit';
      if (action.state !== 'miss') state.attackFxCycle += 1;
      if (action.state === 'miss') state.lastDamage = 0;
      if (state.battle) {
      if (action.state === 'miss') {
        const retaliation = state.battle.miss();
          state.lastSupport = retaliation.guarded ? { name: 'ソウルバリア' } : null;
        if (state.lastSupport) state.supportFxCycle += 1;
        refreshPractice(`ミス。敵の攻撃ゲージ +${retaliation.gaugeAdded}`);
        return;
      } else {
          const strike = state.battle.hit(state.session.combo, Math.random() < state.battle.stats.effects.crit, action.wordEnded, event.key, { wordLength: action.wordLength || 0, wordPerfect: Boolean(action.wordPerfect), wpm: state.session.wpm });
          state.lastDamage = strike.damage || 0;
          state.lastSupport = strike.supports?.[0] || null;
          if (state.lastSupport) state.supportFxCycle += 1;
          if (isOriginShiftResult(strike)) {
            beginOriginShift(strike.damage || 0);
            return;
          }
          if (isFinalShiftResult(strike)) {
            beginFinalShift(strike.damage || 0);
            return;
          }
          if (strike.enemyDefeated && strike.stageCleared) {
            beginBossFinisher(strike.damage || 0);
            return;
          }
          if (strike.enemyDefeated) {
            const advanced = state.battle.advanceWave();
            syncBattleTypingPrompt();
            saveProfile(profile);
            state.lastDamage = 0;
            state.lastSupport = null;
            state.attackFx = 'idle';
            if (!maybeBeginBattleIntro(advanced)) refreshPractice(advanced.chain ? '連鎖発動。ツインズの分身が出現した。' : '敵を撃破。次の敵が出現した。');
            return;
          }
      }
    }
      refreshPractice(action.state === 'miss' ? `「${action.expected === ' ' ? 'SPACE' : action.expected.toUpperCase()}」を入力してください` : action.state === 'lesson' ? '単語列を修復しました。次の単語へ。' : action.wordEnded ? 'WORD COMPLETE · 追撃発生' : state.battle ? `${state.battle.enemy.name}  HP ${state.battle.enemy.hp}/${state.battle.enemy.maxHp}  |  BURST ${state.battle.burst}%` : '正確な入力です。');
  };
  if (session.mode === 'TIME ATTACK') {
    state.timer = setInterval(() => {
      const remaining = Math.max(0, 60000 - (performance.now() - startedAt));
      const clock = document.querySelector('#practice-clock');
      if (clock) clock.textContent = (remaining / 1000).toFixed(1);
      refreshPractice();
      if (remaining <= 0) finishSession();
    }, 100);
  }
}

function render() {
  clearInterval(state.timer);
  clearInterval(state.enemyTimer);
  clearTimeout(state.attackResetTimer);
  state.timer = null;
  state.enemyTimer = null;
  state.attackResetTimer = null;
  window.onkeydown = null;
  document.documentElement.classList.toggle('reduced-motion', Boolean(state.settings.reducedMotion));
  const view = ({ home, quest, character, party, armory, stats, codex, story, settings, practice, result })[state.route] || home;
  app.innerHTML = shell(view());
  bind();
  const audioScene = state.dialogue ? 'dialogue' : state.route === 'practice' && state.battle ? (state.battle.enemy?.tier === 'boss' ? 'boss' : 'battle') : ['quest', 'story', 'codex'].includes(state.route) ? 'archive' : 'haven';
  audio.setScene(audioScene);
  if (state.route === 'practice' && state.session && !state.dialogue) activateTyping();
}

function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }

function advanceDialogue(skip = false) {
  if (!state.dialogue) return;
  if (!skip && state.dialogue.index + 1 < state.dialogue.lines.length) {
    audio.cue('select');
    state.dialogue.index += 1;
    render();
    return;
  }
  profile.meta.story.dialoguesSeen ??= [];
  const sceneKey = state.dialogue.sceneKey || `stage-${state.dialogue.stageId}`;
  if (!profile.meta.story.dialoguesSeen.includes(sceneKey)) profile.meta.story.dialoguesSeen.push(sceneKey);
  state.dialogue = null;
  state.attackFx = 'idle';
  audio.cue('select');
  saveProfile(profile);
  render();
  setTimeout(() => toast('戦闘開始。文字を入力して攻撃してください。'), 120);
}

function bind() {
  document.querySelectorAll('[data-dialogue-next]').forEach((el) => el.addEventListener('click', () => advanceDialogue(false)));
  document.querySelectorAll('[data-dialogue-skip]').forEach((el) => el.addEventListener('click', () => advanceDialogue(true)));
  if (state.dialogue) {
    window.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advanceDialogue(false); }
      if (event.key === 'Escape') { event.preventDefault(); advanceDialogue(true); }
    };
  }
  document.querySelectorAll('[data-route]').forEach((el) => el.addEventListener('click', () => {
    audio.cue('select');
    if (el.dataset.route === 'quest' && state.battle) {
      clearFinalShiftTimer();
      clearBossFinisherTimer();
      clearBattleIntroTimer();
      clearInterval(state.enemyTimer);
      state.session = null;
      state.battle = null;
      state.dialogue = null;
      state.battleIntro = null;
      state.victory = null;
      state.defeat = false;
    }
    location.hash = el.dataset.route;
  }));
  document.querySelectorAll('[data-action="next-node"]').forEach((el) => el.addEventListener('click', advanceResult));
  if (state.route === 'result' && state.lastResult?.mode === 'BATTLE') {
    window.onkeydown = (event) => {
      if (event.key !== 'Enter' || event.isComposing || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      advanceResult();
    };
  }
  document.querySelectorAll('[data-campaign-chapter]').forEach((el) => el.addEventListener('click', () => {
    audio.cue('select');
    state.campaignChapter = el.dataset.campaignChapter;
    render();
  }));
  document.querySelectorAll('[data-setting]').forEach((el) => el.addEventListener('click', () => {
    const key = el.dataset.setting;
    state.settings[key] = !state.settings[key];
    profile.settings = { ...state.settings, showKb: state.settings.keyboard };
    saveProfile(profile);
    audio.unlock().then(() => audio.sync());
    render();
    toast(`${el.parentElement.querySelector('h3').textContent}を${state.settings[key] ? 'オン' : 'オフ'}にしました。`);
  }));
  document.querySelectorAll('[data-mode]').forEach((el) => el.addEventListener('click', () => startSession(el.dataset.mode)));
    document.querySelectorAll('[data-campaign-node]').forEach((el) => el.addEventListener('click', () => {
      const node = campaignNodeById(el.dataset.campaignNode);
      if (node) startSession('BATTLE', node.battleStageId, node.id);
    }));
    document.querySelectorAll('[data-stage]').forEach((el) => el.addEventListener('click', () => startSession('BATTLE', Number(el.dataset.stage))));
    document.querySelectorAll('[data-action="practice"], [data-action="again"]').forEach((el) => el.addEventListener('click', () => startSession('TRAINING')));
    document.querySelectorAll('[data-key-detail]').forEach((el) => el.addEventListener('click', () => {
      state.analysisKey = el.dataset.keyDetail;
      render();
    }));
    document.querySelectorAll('[data-codex-tab]').forEach((el) => el.addEventListener('click', () => {
      state.codexTab = el.dataset.codexTab;
      render();
    }));
    document.querySelectorAll('[data-title]').forEach((el) => el.addEventListener('click', () => {
      const title = getTitle(profile, el.dataset.title);
      const ok = equipTitle(profile, el.dataset.title);
      saveProfile(profile);
      render();
      toast(ok ? `称号「${title.name}」を装備しました。${title.effectText}` : 'この称号はまだ解放されていません。');
    }));
  document.querySelectorAll('[data-party]').forEach((el) => el.addEventListener('click', () => {
      const companion = companionById(el.dataset.party);
      const ok = setCompanionParty(profile, el.dataset.party);
      saveProfile(profile);
      render();
      toast(ok && companion ? `${companion.name}の同行状態を変更しました。` : 'この仲間はまだ救出されていません。');
    }));
    document.querySelectorAll('[data-support-slot]').forEach((el) => el.addEventListener('click', () => activateManualSupport(Number(el.dataset.supportSlot))));
    document.querySelectorAll('[data-action="finish"]').forEach((el) => el.addEventListener('click', finishSession));
    document.querySelectorAll('[data-action="export-save"]').forEach((el) => el.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `type-shift-save-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); audio.cue('unlock'); toast('セーブデータをバックアップしました。');
    }));
    document.querySelectorAll('[data-action="import-save"]').forEach((el) => el.addEventListener('click', () => document.querySelector('#save-import')?.click()));
    const importInput = document.querySelector('#save-import');
    if (importInput) importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        state.saveNotice = { type: 'error', text: '読み込みを中止しました。ファイルサイズは5MB以下にしてください。' };
        render();
        return;
      }
      try {
        const parsed = JSON.parse(await file.text());
        const validation = validateProfile(parsed);
        if (!validation.valid) {
          state.saveNotice = { type: 'error', text: `読み込みを中止しました：${validation.errors.join(' ')}` };
          render();
          return;
        }
        profile = validation.profile;
        ensureMetaProgression(profile);
        saveProfile(profile);
        state.settings = { ...profile.settings, keyboard: profile.settings.showKb };
        state.session = null;
        state.battle = null;
        state.dialogue = null;
        state.victory = null;
        state.defeat = false;
        state.saveNotice = { type: 'success', text: 'バックアップを検証し、セーブデータを復元しました。' };
        audio.sync();
        audio.cue('unlock');
        render();
        toast('セーブデータを復元しました。');
      } catch (_) {
        state.saveNotice = { type: 'error', text: '読み込みを中止しました。有効なJSONファイルではありません。' };
        render();
      }
    });
  document.querySelectorAll('[data-story]').forEach((el) => el.addEventListener('click', () => {
    const entry = storyArchive(profile).find((item) => item.id === el.dataset.story);
    if (!entry?.unlocked) return;
    if (!profile.meta.story.seen.includes(entry.id)) profile.meta.story.seen.push(entry.id);
    state.storyEntry = entry.id;
    saveProfile(profile);
    audio.cue('select');
    render();
  }));
  document.querySelectorAll('[data-story-close]').forEach((el) => el.addEventListener('click', () => { state.storyEntry = null; audio.cue('select'); render(); }));
    document.querySelectorAll('[data-weapon]').forEach((el) => el.addEventListener('click', () => { const id = el.dataset.weapon; const owned = ensureRpg(profile).weapons.owned.includes(id); const ok = owned ? equipWeapon(profile, id) : buyWeapon(profile, id); saveProfile(profile); render(); toast(ok ? (owned ? '武器を装備しました。' : '武器を獲得しました。') : 'Goldが不足しています。'); }));
    document.querySelectorAll('[data-enhance]').forEach((el) => el.addEventListener('click', () => { const ok = enhanceWeapon(profile, el.dataset.enhance); saveProfile(profile); render(); toast(ok ? '武器を強化しました。' : 'Goldまたは言片が不足しているか、強化上限です。'); }));
    document.querySelectorAll('[data-evolve]').forEach((el) => el.addEventListener('click', () => { const ok = evolveWeapon(profile, el.dataset.evolve); saveProfile(profile); render(); toast(ok ? '武器が進化しました。' : '+10と輝晶が必要です。'); }));
  document.querySelectorAll('[data-skill]').forEach((el) => el.addEventListener('click', () => { const ok = unlockSkill(profile, el.dataset.skill); saveProfile(profile); render(); toast(ok ? 'スキルを習得しました。' : 'SPが不足しています。'); }));
}

window.addEventListener('hashchange', () => { state.route = location.hash.slice(1) || 'home'; render(); });
window.addEventListener('online', () => { state.online = true; render(); toast('オンライン接続へ復帰しました。'); });
window.addEventListener('offline', () => { state.online = false; render(); toast('オフラインモードへ切り替えました。'); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const isLocalPreview = ['127.0.0.1', 'localhost'].includes(location.hostname);

    try {
      if (isLocalPreview) {
        // 開発中のプレビューでは、古いService Workerが修正前の画面を返さないよう解除する。
        const hadController = Boolean(navigator.serviceWorker.controller);
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames
              .filter((name) => name.startsWith('type-shift-'))
              .map((name) => caches.delete(name))
          );
        }

        if (hadController && !sessionStorage.getItem('type-shift-preview-refreshed')) {
          sessionStorage.setItem('type-shift-preview-refreshed', '1');
          location.reload();
        }
        return;
      }

      await navigator.serviceWorker.register('./sw.js');
    } catch (error) {
      console.warn('Service Worker の更新に失敗しました。', error);
    }
  });
}
render();
document.documentElement.dataset.appBoot = 'ready';
