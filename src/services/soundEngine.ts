export type SoundType =
  | "move" | "capture" | "check" | "checkmate"
  | "gameStart" | "victory" | "defeat" | "draw"
  | "promotion" | "castling" | "storyPanel" | "uiClick";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _enabled = true;
  private _volume = 0.6;

  get enabled() { return this._enabled; }
  get volume()  { return this._volume; }

  setEnabled(v: boolean) {
    this._enabled = v;
    if (this.master) this.master.gain.value = v ? this._volume : 0;
  }

  setVolume(v: number) {
    this._volume = v;
    if (this.master && this._enabled) this.master.gain.value = v;
  }

  private init(): AudioContext {
    if (!this.ctx) {
      this.ctx    = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._enabled ? this._volume : 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  play(type: SoundType) {
    if (!this._enabled) return;
    try {
      const ctx = this.init();
      const dest = this.master!;
      SOUNDS[type](ctx, dest);
    } catch (_) {}
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function osc(
  ctx: AudioContext, dest: AudioNode,
  type: OscillatorType, freq: number,
  t: number, vol: number, dur: number,
  freqEnd?: number,
) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const now = ctx.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(freq, now + t);
  if (freqEnd !== undefined) {
    o.frequency.exponentialRampToValueAtTime(freqEnd, now + t + dur);
  }
  g.gain.setValueAtTime(vol, now + t);
  g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
  o.connect(g); g.connect(dest);
  o.start(now + t); o.stop(now + t + dur + 0.01);
}

function noise(
  ctx: AudioContext, dest: AudioNode,
  t: number, vol: number, dur: number, cutoff = 800,
) {
  const buf  = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const flt = ctx.createBiquadFilter();
  flt.type = "lowpass";
  flt.frequency.value = cutoff;

  const g = ctx.createGain();
  const now = ctx.currentTime;
  g.gain.setValueAtTime(vol, now + t);
  g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

  src.connect(flt); flt.connect(g); g.connect(dest);
  src.start(now + t); src.stop(now + t + dur + 0.01);
}

// ── Sound definitions ─────────────────────────────────────────────────────────

const SOUNDS: Record<SoundType, (ctx: AudioContext, dest: AudioNode) => void> = {

  // Short digital click — wooden feel
  move(ctx, dest) {
    osc(ctx, dest, "square",   320, 0,    0.10, 0.055);
    osc(ctx, dest, "sine",     160, 0,    0.06, 0.07);
    noise(ctx, dest,           0,    0.04, 0.04, 600);
  },

  // Heavy thud — piece taken
  capture(ctx, dest) {
    osc(ctx, dest, "sawtooth",  80, 0,    0.25, 0.18);
    osc(ctx, dest, "square",   180, 0,    0.12, 0.12);
    noise(ctx, dest,           0,    0.20, 0.15, 1200);
  },

  // Two-beep warning — check!
  check(ctx, dest) {
    osc(ctx, dest, "sine",  880, 0,    0.18, 0.09);
    osc(ctx, dest, "sine", 1760, 0,    0.08, 0.09);
    osc(ctx, dest, "sine",  880, 0.14, 0.15, 0.09);
    osc(ctx, dest, "sine", 1760, 0.14, 0.07, 0.09);
  },

  // Descending dramatic chord — game over
  checkmate(ctx, dest) {
    const notes = [523.25, 415.30, 329.63, 261.63]; // C5 Ab4 E4 C4
    notes.forEach((f, i) => {
      osc(ctx, dest, "sawtooth", f, i * 0.13, 0.28 - i * 0.04, 0.5);
    });
    noise(ctx, dest, 0, 0.08, 0.6, 200);
  },

  // Cyberpunk power-up sweep
  gameStart(ctx, dest) {
    osc(ctx, dest, "sawtooth", 110, 0,    0.20, 0.35, 440);
    osc(ctx, dest, "square",   220, 0.1,  0.10, 0.25, 660);
    osc(ctx, dest, "sine",     440, 0.25, 0.18, 0.20);
    osc(ctx, dest, "sine",     880, 0.32, 0.10, 0.15);
  },

  // Triumphant arpeggio — C E G C
  victory(ctx, dest) {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      osc(ctx, dest, "sine",     f,       i * 0.12, 0.22, 0.35);
      osc(ctx, dest, "triangle", f * 1.5, i * 0.12, 0.07, 0.35);
    });
  },

  // Descending minor — defeat
  defeat(ctx, dest) {
    const notes = [392, 311.13, 261.63, 196];
    notes.forEach((f, i) => {
      osc(ctx, dest, "sawtooth", f, i * 0.14, 0.18 - i * 0.02, 0.45);
    });
    noise(ctx, dest, 0, 0.05, 0.8, 150);
  },

  // Neutral ending
  draw(ctx, dest) {
    osc(ctx, dest, "sine", 440, 0,    0.12, 0.3);
    osc(ctx, dest, "sine", 440, 0.2,  0.08, 0.25);
    osc(ctx, dest, "sine", 440, 0.36, 0.05, 0.2);
  },

  // Rising sparkle — pawn becomes queen
  promotion(ctx, dest) {
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    freqs.forEach((f, i) => {
      osc(ctx, dest, "sine", f, i * 0.07, 0.15, 0.25);
    });
    noise(ctx, dest, 0, 0.06, 0.3, 4000);
  },

  // Double mechanical click — castling
  castling(ctx, dest) {
    osc(ctx, dest, "square", 350, 0,    0.12, 0.06);
    osc(ctx, dest, "square", 280, 0.09, 0.10, 0.06);
    noise(ctx, dest,          0,   0.05, 0.05, 500);
    noise(ctx, dest,          0.09, 0.04, 0.05, 500);
  },

  // Soft whoosh — story panel slide
  storyPanel(ctx, dest) {
    noise(ctx, dest, 0, 0.09, 0.28, 3000);
    osc(ctx, dest, "sine", 600, 0, 0.06, 0.28, 150);
  },

  // Tiny tap — UI
  uiClick(ctx, dest) {
    osc(ctx, dest, "square", 280, 0, 0.06, 0.04);
  },
};

export const soundEngine = new SoundEngine();

// Load persisted settings
try {
  const cfg = JSON.parse(localStorage.getItem("chess_settings") ?? "{}");
  if (typeof cfg.sounds === "boolean")      soundEngine.setEnabled(cfg.sounds);
  if (typeof cfg.soundVolume === "number")  soundEngine.setVolume(cfg.soundVolume);
} catch (_) {}
