import { metaCombatBonuses } from '../meta/progression.js?v=enemy-art-batch-v50';

export const WEAPONS = [
  { id: 'starter', name: '旅立ちの剣', rarity: 'N', atk: 0, mult: 1.00, element: 'none', cost: 0, evolve: 'lumen', evolveCost: 2, art: 'assets/weapons/starter-v1.png', battleArt: 'assets/battle-ren-aster-v3-ultrawide.png' },
  { id: 'lumen', name: 'ルーメン・エッジ', rarity: 'R', atk: 25, mult: 1.08, element: 'light', cost: 180, evolve: null, art: 'assets/weapons/lumen-v1.png', battleArt: 'assets/battle-ren-lumen-v1.png' },
  { id: 'gale', name: '疾風の剣', rarity: 'R', atk: 18, mult: 1.10, element: 'shadow', cost: 260, evolve: null, art: 'assets/weapons/gale-v1.png', battleArt: 'assets/battle-ren-gale-v1.png' },
  { id: 'resonance', name: '共鳴の大剣', rarity: 'SR', atk: 42, mult: 1.22, element: 'flame', cost: 760, evolve: null, art: 'assets/weapons/resonance-v1.png', battleArt: 'assets/battle-ren-resonance-v1.png' },
];

export const SKILLS = [
  { id: 'atk1', branch: '攻勢', tier: 1, name: '攻勢 I', cost: 1, text: '攻撃力 +5%', effect: { atk: .05 } },
  { id: 'atk2', branch: '攻勢', tier: 2, name: '攻勢 II', cost: 2, text: '攻撃力 +8%', effect: { atk: .08 }, requires: 'atk1' },
  { id: 'crit1', branch: '攻勢', tier: 3, name: '会心の理', cost: 2, text: '会心率 +8%', effect: { crit: .08 }, requires: 'atk2' },
  { id: 'finisher', branch: '攻勢', tier: 4, name: '終端斬', cost: 3, text: '単語追撃 +25%', effect: { finisher: .25 }, requires: 'crit1' },
  { id: 'focus1', branch: '集中', tier: 1, name: '集中 I', cost: 1, text: 'Burst獲得 +15%', effect: { burst: .15 } },
  { id: 'focus2', branch: '集中', tier: 2, name: '集中 II', cost: 2, text: '弱点ダメージ +15%', effect: { weak: .15 }, requires: 'focus1' },
  { id: 'tempo', branch: '集中', tier: 3, name: '時流', cost: 2, text: 'コンボ倍率を強化', effect: { combo: .1 }, requires: 'focus2' },
  { id: 'burst2', branch: '集中', tier: 4, name: '文字爆ぜ', cost: 3, text: 'Burst威力 +20%', effect: { burstDamage: .2 }, requires: 'tempo' },
  { id: 'guard1', branch: '防衛', tier: 1, name: '耐性 I', cost: 1, text: '最大HP +10%', effect: { hp: .1 } },
  { id: 'guard2', branch: '防衛', tier: 2, name: '耐性 II', cost: 2, text: '被ダメージ -8%', effect: { guard: .08 }, requires: 'guard1' },
  { id: 'recovery', branch: '防衛', tier: 3, name: '復元術', cost: 2, text: '単語完成時HPを2回復', effect: { heal: 2 }, requires: 'guard2' },
  { id: 'aegis', branch: '防衛', tier: 4, name: 'イージス', cost: 3, text: '開始時Burst +20', effect: { startBurst: 20 }, requires: 'recovery' },
];

const weaponById = (id) => WEAPONS.find((weapon) => weapon.id === id) || WEAPONS[0];

function archiveWeapon(profile, id) {
  profile.meta.codex ??= { enemies: [], weapons: ['starter'] };
  profile.meta.codex.weapons ??= ['starter'];
  if (!profile.meta.codex.weapons.includes(id)) profile.meta.codex.weapons.push(id);
}

export function ensureRpg(profile) {
  profile.rpg.materials ??= { kotonoha: 0, shard: 0 };
  profile.rpg.weapons ??= { owned: ['starter'], equipped: 'starter', plus: {}, evolved: {} };
  profile.rpg.weapons.plus ??= {};
  profile.rpg.weapons.evolved ??= {};
  profile.rpg.skills ??= { tree: [] };
  profile.rpg.companions ??= { rescued: [], party: [], bond: {}, siblingGauge: 0, senrinTrials: { still: false, flow: false, insight: false, failures: 0 }, noxRevealed: false, finalUnlocked: false };
  return profile.rpg;
}

export function getWeapon(profile) { const rpg = ensureRpg(profile); return weaponById(rpg.weapons.equipped); }
export function weaponPlus(profile, id) { return ensureRpg(profile).weapons.plus[id] || 0; }
export function enhanceCost(profile, id) { const plus = weaponPlus(profile, id); return { gold: (plus + 1) * 80, kotonoha: 1 }; }
export function buyWeapon(profile, id) { const rpg = ensureRpg(profile); const weapon = weaponById(id); if (rpg.weapons.owned.includes(id) || rpg.gold < weapon.cost) return false; rpg.gold -= weapon.cost; rpg.weapons.owned.push(id); archiveWeapon(profile, id); return true; }
export function equipWeapon(profile, id) { const rpg = ensureRpg(profile); if (!rpg.weapons.owned.includes(id)) return false; rpg.weapons.equipped = id; archiveWeapon(profile, id); return true; }
export function enhanceWeapon(profile, id) { const rpg = ensureRpg(profile); const weapon = weaponById(id); const cap = weapon.rarity === 'SSR' ? 15 : weapon.rarity === 'SR' ? 12 : 10; const cost = enhanceCost(profile, id); if (!rpg.weapons.owned.includes(id) || weaponPlus(profile, id) >= cap || rpg.gold < cost.gold || rpg.materials.kotonoha < cost.kotonoha) return false; rpg.gold -= cost.gold; rpg.materials.kotonoha -= cost.kotonoha; rpg.weapons.plus[id] = weaponPlus(profile, id) + 1; return true; }
export function evolveWeapon(profile, id) { const rpg = ensureRpg(profile); const weapon = weaponById(id); if (!weapon.evolve || weaponPlus(profile, id) < 10 || rpg.materials.shard < weapon.evolveCost) return false; rpg.materials.shard -= weapon.evolveCost; rpg.weapons.owned = rpg.weapons.owned.filter((owned) => owned !== id); rpg.weapons.owned.push(weapon.evolve); rpg.weapons.equipped = weapon.evolve; rpg.weapons.evolved[id] = true; archiveWeapon(profile, id); archiveWeapon(profile, weapon.evolve); return true; }
export function unlockSkill(profile, id) { const rpg = ensureRpg(profile); const skill = SKILLS.find((item) => item.id === id); if (!skill || rpg.skills.tree.includes(id) || (skill.requires && !rpg.skills.tree.includes(skill.requires)) || rpg.sp < skill.cost) return false; rpg.sp -= skill.cost; rpg.skills.tree.push(id); return true; }
export function combatStats(profile) {
  const rpg = ensureRpg(profile);
  const weapon = getWeapon(profile);
  const effects = { atk: 0, crit: .08, hp: 0, guard: 0, burst: 0, weak: 0, combo: 0, finisher: 0, heal: 0, startBurst: 0, burstDamage: 0 };
  rpg.skills.tree.forEach((id) => Object.entries(SKILLS.find((item) => item.id === id)?.effect || {}).forEach(([key, value]) => { effects[key] += value; }));
  Object.entries(metaCombatBonuses(profile)).forEach(([key, value]) => { effects[key] = (effects[key] || 0) + value; });
  return {
    weapon,
    plus: weaponPlus(profile, weapon.id),
    effects,
    atk: (22 + profile.rpg.level * 4 + weapon.atk + weaponPlus(profile, weapon.id) * 4) * (1 + effects.atk),
    maxHp: Math.round((220 + (profile.rpg.level - 1) * 28) * (1 + effects.hp)),
  };
}
