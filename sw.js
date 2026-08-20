const CACHE = 'type-shift-rescue-reveal-v57';
const CORE_FILES = [
  './',
  './index.html',
  './css/base.css?v=rescue-reveal-v57',
  './js/main.js?v=rescue-reveal-v57',
  './js/core/audio.js?v=boss-finish-v53',
  './js/core/bus.js?v=enemy-art-batch-v50',
  './js/core/storage.js?v=enemy-art-batch-v50',
  './js/engine/chars.js?v=enemy-art-batch-v50',
  './js/engine/typing.js?v=difficulty-v51',
  './js/engine/chars.js?v=difficulty-v51',
  './js/engine/words.js?v=enemy-art-batch-v50',
  './js/meta/progression.js?v=enemy-art-batch-v50',
  './js/meta/dialogue.js?v=enemy-art-batch-v50',
  './js/rpg/battle.js?v=difficulty-v51',
  './js/rpg/difficulty.js?v=difficulty-v51',
  './js/rpg/campaign.js?v=enemy-art-batch-v50',
  './js/rpg/companions.js?v=enemy-art-batch-v50',
  './js/rpg/enemy-art.js?v=enemy-art-batch-v50',
  './js/rpg/enemy-catalog.js?v=enemy-art-batch-v50',
  './js/rpg/weapon-art.js?v=enemy-art-batch-v50',
  './js/rpg/progression.js?v=enemy-art-batch-v50',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/home-ren-aster-v2.png',
  './assets/ren-aster-keyart-v2.png',
  './assets/battle-ren-aster-v2.png',
  './assets/battle-ren-aster-v3-ultrawide.png',
  './assets/battle-ren-lumen-v1.png',
  './assets/battle-ren-gale-v1.png',
  './assets/battle-ren-resonance-v1.png',
  './assets/battle/stages/stage-01-bg-v1.png',
  './assets/battle/stages/stage-02-bg-v1.png',
  './assets/battle/stages/stage-03-bg-v1.png',
  './assets/battle/stages/stage-04-bg-v1.png',
  './assets/battle/stages/stage-05-bg-v1.png',
  './assets/battle/stages/stage-06-bg-v1.png',
  './assets/battle/stages/god-origin-realm-bg-v1.png',
  './assets/battle/stages/stage-08-bg-v1.png',
  './assets/battle/player/ren-idle-cutout-v1.png',
  './assets/battle/player/ren-strike-cutout-v1.png',
  './assets/companions/nox-v1.png',
  './assets/companions/lilia-v1.png',
  './assets/companions/glen-v1.png',
  './assets/companions/fiona-v1.png',
  './assets/companions/celeste-v1.png',
  './assets/companions/senrin-v1.png',
  './assets/enemies/glitch-v2.png',
  './assets/enemies/ember-v2.png',
  './assets/enemies/wisp-v2.png',
  './assets/enemies/shell-v2.png',
  './assets/enemies/twins-v2.png',
  './assets/enemies/noise-v2.png',
  './assets/enemies/wordeater-v2.png',
  './assets/enemies/pyre-v2.png',
  './assets/enemies/mirror-v2.png',
  './assets/enemies/leech-v2.png',
  './assets/enemies/guardian-v2.png',
  './assets/enemies/sovereign-v2.png',
  './assets/enemies/sovereign-cutout-v4.png',
  './assets/enemies/noxshade-cutout-v4.png',
  './assets/enemies/senrinseal-cutout-v4.png',
  './assets/enemies/nullking-cutout-v4.png',
  './assets/enemies/boss-gaius-cutout-v1.png',
  './assets/enemies/boss-volcarion-cutout-v1.png',
  './assets/enemies/boss-celestia-cutout-v1.png',
  './assets/enemies/boss-agniros-cutout-v1.png',
  './assets/enemies/boss-frostnova-cutout-v1.png',
  './assets/enemies/boss-raidingald-cutout-v1.png',
  './assets/enemies/king-chronos-cutout-v1.png',
  './assets/enemies/king-aerpocalion-cutout-v1.png',
  './assets/enemies/king-necros-cutout-v1.png',
  './assets/enemies/alpha-origin-cutout-v1.png',
  './assets/enemies/unique/rune-slime-cutout-v1.png',
  './assets/enemies/unique/rune-crystal-cutout-v1.png',
  './assets/enemies/unique/glitch-spider-cutout-v1.png',
  './assets/enemies/unique/rune-golem-cutout-v1.png',
  './assets/enemies/unique/glitch-mimic-cutout-v1.png',
  './assets/enemies/unique/rune-elemental-cutout-v1.png',
  './assets/enemies/unique/skeleton-soldier-cutout-v1.png',
  './assets/enemies/unique/machine-drone-cutout-v1.png',
  './assets/enemies/unique/rusted-spearman-cutout-v1.png',
  './assets/enemies/unique/glitch-spark-cutout-v1.png',
  './assets/enemies/unique/armored-troll-cutout-v1.png',
  './assets/enemies/unique/cyclops-cutout-v1.png',
  './assets/enemies/unique/stone-troll-cutout-v1.png',
  './assets/enemies/unique/glitch-golem-cutout-v1.png',
  './assets/enemies/unique/spike-ball-cutout-v1.png',
  './assets/enemies/unique/dark-mage-cutout-v1.png',
  './assets/enemies/unique/rune-hunter-cutout-v1.png',
  './assets/enemies/unique/death-knight-cutout-v1.png',
  './assets/enemies/unique/rune-guardian-cutout-v1.png',
  './assets/enemies/unique/noise-fallen-cutout-v1.png',
  './assets/enemies/unique/glitch-maiden-cutout-v1.png',
  './assets/enemies/unique/shadow-bat-cutout-v1.png',
  './assets/enemies/unique/noise-imp-cutout-v1.png',
  './assets/enemies/unique/void-scorpion-cutout-v1.png',
  './assets/enemies/unique/shadow-wolf-cutout-v1.png',
  './assets/enemies/unique/void-knight-cutout-v1.png',
  './assets/enemies/unique/abyss-spirit-cutout-v1.png',
  './assets/enemies/unique/dark-slime-cutout-v1.png',
  './assets/enemies/unique/goblin-warrior-cutout-v1.png',
  './assets/enemies/unique/goblin-archer-cutout-v1.png',
  './assets/enemies/unique/wood-slime-cutout-v1.png',
  './assets/enemies/unique/blind-bat-cutout-v1.png',
  './assets/enemies/unique/dark-wolf-cutout-v1.png',
  './assets/enemies/unique/shadow-imp-cutout-v1.png',
  './assets/enemies/unique/shadow-slime-cutout-v1.png',
  './assets/enemies/unique/void-slime-cutout-v1.png',
  './assets/enemies/unique/dark-imp-cutout-v1.png',
  './assets/enemies/unique/goblin-shaman-cutout-v2.png',
  './assets/enemies/unique/wind-imp-cutout-v2.png',
  './assets/enemies/unique/earth-imp-cutout-v2.png',
  './assets/enemies/unique/light-imp-cutout-v1.png',
  './assets/enemies/unique/ghost-cutout-v1.png',
  './assets/enemies/unique/light-slime-cutout-v2.png',
  './assets/enemies/unique/poison-slime-cutout-v1.png',
  './assets/enemies/unique/index-blade-cutout-v1.png',
  './assets/enemies/unique/corrupt-guardian-cutout-v1.png',
  './assets/enemies/unique/sand-worm-cutout-v1.png',
  './assets/enemies/unique/curse-priest-cutout-v1.png',
  './assets/enemies/unique/shadow-chimera-cutout-v1.png',
  './assets/enemies/unique/void-reaper-cutout-v1.png',
  './assets/enemies/unique/blood-golem-cutout-v1.png',
  './assets/enemies/unique/young-dark-dragon-cutout-v1.png',
  './assets/enemies/unique/shadow-assassin-cutout-v1.png',
  './assets/enemies/unique/cursed-swordsman-cutout-v1.png',
  './assets/enemies/unique/cursed-knight-cutout-v1.png',
  './assets/enemies/unique/crystal-worm-cutout-v1.png',
  './assets/enemies/unique/void-hound-cutout-v1.png',
  './assets/enemies/unique/hell-stalker-cutout-v1.png',
  './assets/enemies/unique/void-drake-cutout-v1.png',
  './assets/enemies/unique/dark-fairy-cutout-v1.png',
  './assets/enemies/unique/skeleton-archer-cutout-v1.png',
  './assets/enemies/unique/goblin-bombardier-cutout-v1.png',
  './assets/enemies/unique/blood-leech-cutout-v1.png',
  './assets/enemies/unique/cultist-cutout-v1.png',
  './assets/enemies/unique/berserker-cutout-v1.png',
  './assets/enemies/unique/sister-worm-cutout-v1.png',
  './assets/enemies/unique/rune-mage-cutout-v1.png',
  './assets/enemies/unique/noise-slime-cutout-v1.png',
  './assets/enemies/unique/troll-cutout-v1.png',
  './assets/enemies/unique/blood-ogre-cutout-v1.png',
  './assets/enemies/unique/flame-slime-cutout-v1.png',
  './assets/enemies/unique/ice-slime-cutout-v1.png',
  './assets/enemies/unique/storm-slime-cutout-v1.png',
  './assets/enemies/unique/earth-slime-cutout-v1.png',
  './assets/enemies/unique/skeleton-mage-cutout-v1.png',
  './assets/enemies/unique/fire-imp-cutout-v1.png',
  './assets/enemies/unique/ice-imp-cutout-v1.png',
  './assets/enemies/unique/thunder-imp-cutout-v1.png',
  './assets/enemies/unique/plasma-slime-cutout-v1.png',
  './assets/enemies/unique/crystal-worm-variation-cutout-v1.png',
  './assets/companions/fiona-v1.png',
  './assets/companions/glen-v1.png',
  './assets/companions/lilia-v1.png',
  './assets/companions/celeste-v1.png',
  './assets/companions/veil-v1.png',
  './assets/companions/nox-v1.png',
  './assets/companions/senrin-v1.png',
  './assets/weapons/starter-v1.png',
  './assets/weapons/lumen-v1.png',
  './assets/weapons/gale-v1.png',
  './assets/weapons/resonance-v1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith('type-shift-') && name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => { if (response.ok) caches.open(CACHE).then((cache) => cache.put('./index.html', response.clone())); return response; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const update = fetch(request)
        .then((response) => { if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone())); return response; })
        .catch(() => cached || new Response('Offline', { status: 503, statusText: 'Offline' }));
      return cached || update;
    })
  );
});
