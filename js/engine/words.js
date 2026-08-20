// オフラインでも使えるTYPE SHIFT専用の英単語辞書。
// 初期キーだけでも出題できる短語から、数字・記号解放後の実戦語まで段階的に混ぜる。
const BASIC_WORDS = [
  'ate','eat','tea','tie','toe','one','ton','tan','ten','tin','into','note','tone','tine','tent','tint','neat','tote','teen','tenet',
  'stone','steam','team','time','tame','name','mean','meant','mend','mint','mind','made','mate','mode','more','move','most','moon','main',
  'same','seat','site','soon','root','rain','road','read','rate','real','iron','idle','line','lane','late','lost','load','loan','land',
];

const WORLD_WORDS = [
  'noise','sword','world','word','wonder','winter','water','wind','wave','write','rune','run','rise','rest','star','start','state','story',
  'shade','shadow','light','flame','magic','mirror','metal','memory','signal','shift','type','typing','cipher','crystal','forest','tower',
  'archive','battle','blade','brave','quest','guardian','glitch','spirit','dragon','machine','knight','cursor','syntax','letter','record',
  'relic','silent','hollow','broken','repair','restore','rewrite','chapter','codex','script','vector','margin','layout','index','signal',
  'focus','combo','burst','strike','shield','aegis','lumen','gale','resonance','sovereign','fragment','sentence','baseline','bracket',
  'language','lexicon','meaning','memory','restore','shifter','archive','distortion','corruption','reflection','recovery','precision',
  'velocity','accuracy','training','encounter','cathedral','sanctuary','subscript','capital','snowfield','skyline','monument','gateway',
];

const ADVANCED_WORDS = [
  'level 2','stage 3','rank 4','wave 5','chapter 6','sector 7','combo 10','burst 25','guard 50','score 100',
  'ready!','go?','rise!','type!','word?','strike!','restore!','shift!','focus?','clear!',
  'hp-guard','word-link','null/core','type/code','rank-a','wave-b','stage:1','boss:6','combo:50','wpm:60',
  'memory, restored','line. break','signal: active','archive-ready','blade / rune','typing: precise',
];

export const WORDS = [...BASIC_WORDS, ...WORLD_WORDS, ...ADVANCED_WORDS]
  .map((text) => ({ text, chars: [...new Set([...text].filter((char) => char !== ' '))] }));
