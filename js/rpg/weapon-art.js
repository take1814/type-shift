const WEAPON_COLORS = {
  starter: { glow: '#20c7ff', core: '#dffaff' },
  lumen: { glow: '#d6b86a', core: '#fff8dc' },
  gale: { glow: '#8b5cff', core: '#c9b6ff' },
  resonance: { glow: '#ff6675', core: '#ffe0e5' },
};

const WEAPON_ART = {
  starter: 'assets/weapons/starter-v1.png',
  lumen: 'assets/weapons/lumen-v1.png',
  gale: 'assets/weapons/gale-v1.png',
  resonance: 'assets/weapons/resonance-v1.png',
};

export function weaponArt(id, weapon, { locked = false, compact = false, micro = false, plus = 0, equipped = false } = {}) {
  const palette = WEAPON_COLORS[id] || WEAPON_COLORS.starter;
  const label = locked ? '未入手の武器' : `${weapon.name}${plus ? ` 強化+${plus}` : ''}`;
  const art = weapon.art || WEAPON_ART[id] || WEAPON_ART.starter;
  const grade = plus >= 10 ? 'masterwork' : plus >= 5 ? 'awakened' : plus > 0 ? 'enhanced' : 'base';
  return `<figure class="weapon-art weapon-art-${id} ${locked ? 'locked' : ''} ${compact ? 'compact' : ''} ${micro ? 'micro' : ''} ${grade} ${equipped ? 'equipped' : ''}" role="img" aria-label="${label}" style="--weapon-core:${palette.core};--weapon-glow:${palette.glow}">
    <img src="${art}" alt="${label}" loading="lazy" decoding="async">
    <span class="weapon-art-vignette"></span>
    <span class="weapon-art-scan"></span>
    ${plus ? `<b class="weapon-plus">+${plus}</b>` : ''}
    ${equipped ? '<small class="weapon-equipped-mark">EQUIPPED</small>' : ''}
  </figure>`;
}
