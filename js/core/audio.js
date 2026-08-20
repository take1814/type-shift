import { on } from './bus.js?v=enemy-art-batch-v50';

const SCENE_PATTERNS = {
  haven: { tempo: 3200, notes: [110, 164.81, 220, 146.83], wave: 'sine', volume: .018 },
  archive: { tempo: 2800, notes: [98, 146.83, 196, 130.81], wave: 'triangle', volume: .018 },
  dialogue: { tempo: 3600, notes: [82.41, 123.47, 164.81, 110], wave: 'sine', volume: .014 },
  battle: { tempo: 1800, notes: [110, 130.81, 146.83, 164.81], wave: 'sawtooth', volume: .012 },
  boss: { tempo: 1500, notes: [73.42, 87.31, 98, 116.54], wave: 'sawtooth', volume: .014 },
};

export class AudioDirector {
  constructor(settingsProvider) {
    this.settingsProvider = settingsProvider;
    this.context = null;
    this.master = null;
    this.scene = 'haven';
    this.musicTimer = null;
    this.musicStep = 0;
    this.unlocked = false;
    this.installEvents();
  }

  get settings() { return this.settingsProvider?.() || { sfx: false, bgm: false }; }

  ensureContext() {
    if (this.context) return this.context;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    this.context = new Context();
    this.master = this.context.createGain();
    this.master.gain.value = .72;
    this.master.connect(this.context.destination);
    return this.context;
  }

  async unlock() {
    const context = this.ensureContext();
    if (!context) return false;
    if (context.state === 'suspended') await context.resume();
    this.unlocked = context.state === 'running';
    if (this.unlocked) this.sync();
    return this.unlocked;
  }

  tone(frequency, duration = .08, options = {}) {
    if (!this.context || !this.master || this.context.state !== 'running') return;
    const now = this.context.currentTime + (options.delay || 0);
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = options.wave || 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (options.to) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.to), now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(options.volume || .035, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }

  noise(duration = .12, volume = .025) {
    if (!this.context || !this.master || this.context.state !== 'running') return;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    filter.type = 'highpass';
    filter.frequency.value = 900;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
  }

  cue(name) {
    if (!this.settings.sfx || !this.unlocked) return;
    const cues = {
      hit: () => this.tone(620, .045, { wave: 'sine', volume: .018, to: 760 }),
      miss: () => this.tone(150, .13, { wave: 'square', volume: .025, to: 90 }),
      strike: () => { this.noise(.12, .038); this.tone(180, .16, { wave: 'sawtooth', volume: .032, to: 760 }); this.tone(980, .055, { delay: .018, wave: 'triangle', volume: .018, to: 420 }); },
      slash: () => { this.noise(.2, .052); this.tone(1240, .09, { wave: 'sawtooth', volume: .04, to: 180 }); this.tone(420, .28, { delay: .035, wave: 'triangle', volume: .032, to: 70 }); this.tone(1760, .045, { delay: .055, wave: 'sine', volume: .022, to: 680 }); },
      critical: () => { this.tone(880, .14, { wave: 'triangle', volume: .04, to: 1320 }); this.tone(1320, .12, { delay: .06, volume: .026 }); },
      enemy: () => { this.tone(110, .2, { wave: 'sawtooth', volume: .035, to: 58 }); this.noise(.16, .02); },
      burst: () => { [196, 294, 392, 587, 784].forEach((note, index) => this.tone(note, .38, { delay: index * .055, wave: 'sawtooth', volume: .03, to: note * 1.8 })); this.tone(1568, .22, { delay: .24, wave: 'triangle', volume: .035, to: 420 }); },
      'boss-intro': () => { this.tone(55, .7, { wave: 'sawtooth', volume: .038, to: 42 }); this.tone(110, .62, { delay: .08, wave: 'triangle', volume: .026, to: 82 }); this.tone(220, .45, { delay: .2, wave: 'sine', volume: .018, to: 164 }); },
      standoff: () => { this.tone(73.42, .52, { wave: 'sawtooth', volume: .034, to: 58 }); this.tone(146.83, .5, { delay: .1, wave: 'triangle', volume: .026, to: 110 }); },
      ready: () => { this.tone(392, .12, { wave: 'triangle', volume: .026, to: 784 }); this.tone(784, .2, { delay: .08, wave: 'sine', volume: .02, to: 1174 }); },
      victory: () => [392, 523.25, 659.25, 783.99].forEach((note, index) => this.tone(note, .32, { delay: index * .11, wave: 'triangle', volume: .032 })),
      defeat: () => [220, 185, 146.83, 110].forEach((note, index) => this.tone(note, .38, { delay: index * .13, wave: 'sine', volume: .03, to: note * .72 })),
      select: () => this.tone(440, .055, { wave: 'triangle', volume: .018, to: 520 }),
      unlock: () => [523.25, 659.25, 783.99].forEach((note, index) => this.tone(note, .3, { delay: index * .08, wave: 'sine', volume: .026 })),
    };
    cues[name]?.();
  }

  playMusicStep() {
    if (!this.settings.bgm || !this.unlocked) return;
    const pattern = SCENE_PATTERNS[this.scene] || SCENE_PATTERNS.haven;
    const root = pattern.notes[this.musicStep % pattern.notes.length];
    this.tone(root, Math.min(2.2, pattern.tempo / 1000 * .92), { wave: pattern.wave, volume: pattern.volume });
    this.tone(root * 1.5, 1.4, { delay: .12, wave: 'sine', volume: pattern.volume * .52 });
    if (this.scene === 'battle' || this.scene === 'boss') this.tone(root * 2, .08, { delay: .42, wave: 'square', volume: .008 });
    this.musicStep += 1;
  }

  startMusic() {
    this.stopMusic();
    if (!this.settings.bgm || !this.unlocked) return;
    const pattern = SCENE_PATTERNS[this.scene] || SCENE_PATTERNS.haven;
    this.playMusicStep();
    this.musicTimer = window.setInterval(() => this.playMusicStep(), pattern.tempo);
  }

  stopMusic() {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  setScene(scene) {
    const next = SCENE_PATTERNS[scene] ? scene : 'haven';
    if (next === this.scene && this.musicTimer) return;
    this.scene = next;
    this.musicStep = 0;
    this.startMusic();
  }

  sync() {
    if (this.settings.bgm) this.startMusic();
    else this.stopMusic();
  }

  installEvents() {
    on('key:hit', () => this.cue('hit'));
    on('key:miss', () => this.cue('miss'));
    on('battle:damage', (detail) => this.cue(detail?.critical ? 'critical' : 'strike'));
    on('battle:enemy-attack', () => this.cue('enemy'));
  }
}
