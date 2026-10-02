"use client";

/**
 * The teaser's score, made in the browser — all but a few lines said out
 * loud (`say`), which are small recordings fetched only once the sound's on.
 *
 * Off until the visitor turns it on, and never remembered between visits.
 *
 * It's built to move with the page rather than go off at it. Underneath
 * everything, all the time: a low drone, a choir that's mostly breath, wind
 * that rises as you scroll and settles when you stop (`flow`). Each part of
 * the page (`scene`) leans on those differently — slowly, over a couple of
 * seconds, never a cut — and lets one or two things happen in it now and
 * then: a music box half out of tune in the cream rooms, whispers and a
 * floorboard in the dark one, a bell a long way off.
 *
 * The cues on top are few, and they wait their turn: each has its own
 * cooldown, the big ones never pile onto each other, and the atmospheric
 * ones simply don't happen while you're scrolling fast. Quiet and wrong
 * rather than loud; the scares are the only things meant to make you jump,
 * and even they sit under a compressor.
 *
 * Everything is in D minor, leaning on its C# and G#, and goes through one
 * reverb, so it sounds like one room. All of it stops while the tab is
 * hidden.
 */

export type Cue =
  | "tick"
  | "beat"
  | "inhale"
  | "toll"
  | "thud"
  | "hit"
  | "slam"
  | "scare"
  | "meow"
  | "hiss"
  | "growl"
  | "whisper"
  | "creak"
  | "thunder"
  | "musicbox"
  | "beep"
  | "vine";

export type Scene = "none" | "heard" | "room" | "point" | "finale";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let verb: ConvolverNode | null = null;
let bed: Bed | null = null;
let noise: AudioBuffer | null = null;
let on = false;
let current: Scene = "none";
let ambient = 0;
let rushingUntil = 0;
let heartTimer = 0;
let heartRateNow = 0;
const listeners = new Set<(on: boolean) => void>();

type Bed = {
  droneFilter: BiquadFilterNode;
  droneGain: GainNode;
  choirGain: GainNode;
  windGain: GainNode;
  windFilter: BiquadFilterNode;
  /** each part's way out, at its level: what steps back while something's talking */
  outs: [GainNode, number][];
};

export const soundOn = () => on;

export function subscribeSound(fn: (on: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// --- building blocks ---------------------------------------------------------

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const cents = (hz: number, c: number) => hz * Math.pow(2, c / 1200);

function noiseBuffer(c: AudioContext) {
  if (noise) return noise;
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noise = b;
  return b;
}

/** the room everything happens in: four seconds of dark, decaying air */
function impulse(c: AudioContext, seconds = 4, decay = 2.4) {
  const len = Math.floor(c.sampleRate * seconds);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      // a little low-passed, so the tail is dark rather than hissy
      lp = lp * 0.6 + (Math.random() * 2 - 1) * 0.4;
      d[i] = lp * Math.pow(1 - i / len, decay);
    }
  }
  return b;
}

/** where a sound goes: some dry, some into the room */
function bus(c: AudioContext, level: number, wet: number) {
  const g = c.createGain();
  g.gain.value = level;
  g.connect(master!);
  if (wet > 0 && verb) {
    const s = c.createGain();
    s.gain.value = wet;
    g.connect(s).connect(verb);
  }
  return g;
}

function env(g: GainNode, t: number, peak: number, attack: number, release: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
}

function osc(c: AudioContext, type: OscillatorType, hz: number) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = hz;
  return o;
}

function noiseSrc(c: AudioContext) {
  const s = c.createBufferSource();
  s.buffer = noiseBuffer(c);
  s.loop = true;
  return s;
}

function band(c: AudioContext, hz: number, q: number) {
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = hz;
  f.Q.value = q;
  return f;
}

// --- the bed: always there, always moving ------------------------------------

function startBed(c: AudioContext): Bed {
  // the drone: a low D that never settles, a fifth over it
  const droneFilter = c.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 300;
  droneFilter.Q.value = 0.8;
  const droneGain = c.createGain();
  droneGain.gain.value = 0.0001;
  const droneOut = bus(c, 1, 0.35);
  droneFilter.connect(droneGain).connect(droneOut);
  for (const [hz, type, level] of [
    [36.71, "sawtooth", 0.12],
    [cents(36.71, 6), "sawtooth", 0.08],
    [55, "triangle", 0.12],
    [73.42, "sine", 0.05],
  ] as const) {
    const o = osc(c, type, hz);
    const g = c.createGain();
    g.gain.value = level;
    o.connect(g).connect(droneFilter);
    o.start();
  }
  const lfo = osc(c, "sine", 0.045);
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 70;
  lfo.connect(lfoDepth).connect(droneFilter.frequency);
  lfo.start();

  // the choir: a minor chord sung on an "oo", mostly breath, swelling on its own
  const choirGain = c.createGain();
  choirGain.gain.value = 0.0001;
  const vowelA = band(c, 420, 4);
  const vowelB = band(c, 820, 6);
  vowelA.connect(choirGain);
  vowelB.connect(choirGain);
  for (const hz of [146.83, 174.61, 220, 329.63]) {
    for (const dc of [-7, 0, 6]) {
      const o = osc(c, "sawtooth", cents(hz, dc));
      const g = c.createGain();
      g.gain.value = 0.02;
      o.connect(g);
      g.connect(vowelA);
      g.connect(vowelB);
      o.start();
    }
  }
  const breath = osc(c, "sine", 0.06);
  const breathDepth = c.createGain();
  breathDepth.gain.value = 0.35;
  const breathGain = c.createGain();
  breathGain.gain.value = 0.65;
  breath.connect(breathDepth).connect(breathGain.gain);
  const choirOut = bus(c, 0.5, 0.9);
  choirGain.connect(breathGain).connect(choirOut);
  breath.start();

  // the wind: what the scroll moves
  const air = noiseSrc(c);
  const windFilter = band(c, 500, 0.9);
  const windGain = c.createGain();
  windGain.gain.value = 0.0001;
  const pan = c.createStereoPanner();
  const sway = osc(c, "sine", 0.09);
  sway.connect(pan.pan);
  const windOut = bus(c, 1, 0.5);
  air.connect(windFilter).connect(windGain).connect(pan).connect(windOut);
  air.start();
  sway.start();

  const outs: [GainNode, number][] = [
    [droneOut, 1],
    [choirOut, 0.5],
    [windOut, 1],
  ];
  return { droneFilter, droneGain, choirGain, windGain, windFilter, outs };
}

// --- turning it on ----------------------------------------------------------------

export async function setSound(next: boolean) {
  if (typeof window === "undefined") return;
  if (next) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    await ctx.resume();
    if (!master) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 10;
      comp.ratio.value = 10;
      comp.attack.value = 0.003;
      comp.release.value = 0.3;
      comp.connect(ctx.destination);
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(comp);
      verb = ctx.createConvolver();
      verb.buffer = impulse(ctx);
      const ret = ctx.createGain();
      ret.gain.value = 0.7;
      verb.connect(ret).connect(master);
      bed = startBed(ctx);
      fetchLines(ctx);
      document.addEventListener("visibilitychange", () => {
        if (!ctx) return;
        if (document.hidden) void ctx.suspend();
        else if (on) void ctx.resume();
      });
    }
    master.gain.setTargetAtTime(0.8, ctx.currentTime, 1.2);
    on = true;
    applyScene(true);
  } else if (ctx && master) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    on = false;
    window.clearTimeout(ambient);
    heart(0);
    window.setTimeout(() => {
      if (!on) void ctx?.suspend();
    }, 800);
  }
  for (const fn of listeners) fn(on);
}

/** which part of the page you're in; the bed leans into it over a couple of seconds */
export function scene(next: Scene) {
  if (next === current) return;
  current = next;
  applyScene(false);
}

const MIX: Record<Scene, { drone: number; cut: number; choir: number }> = {
  none: { drone: 0.35, cut: 340, choir: 0.15 },
  heard: { drone: 0.4, cut: 380, choir: 0.35 },
  room: { drone: 0.75, cut: 170, choir: 0.12 },
  point: { drone: 0.5, cut: 260, choir: 0.2 },
  finale: { drone: 0.55, cut: 320, choir: 0.6 },
};

function applyScene(fresh: boolean) {
  if (!on || !ctx || !bed) return;
  const t = ctx.currentTime;
  const m = MIX[current];
  bed.droneGain.gain.setTargetAtTime(m.drone, t, 1.6);
  bed.droneFilter.frequency.setTargetAtTime(m.cut, t, 1.8);
  bed.choirGain.gain.setTargetAtTime(m.choir, t, 2.2);
  // what happens in this part of the page, now and then — only once you've
  // been in it a while, and never while you're rushing through
  window.clearTimeout(ambient);
  const s = current;
  const plan: Partial<Record<Scene, [number, number, Cue[]]>> = {
    heard: [14000, 22000, ["musicbox", "musicbox", "toll"]],
    room: [8000, 14000, ["whisper", "whisper", "creak"]],
    point: [16000, 26000, ["toll"]],
    finale: [12000, 20000, ["musicbox", "toll"]],
  };
  const p = plan[s];
  if (!p) return;
  const go = () => {
    if (!on || current !== s) return;
    if (!document.hidden) cue(p[2][Math.floor(Math.random() * p[2].length)]);
    ambient = window.setTimeout(go, rnd(p[0], p[1]));
  };
  ambient = window.setTimeout(go, fresh ? 2500 : rnd(p[0] * 0.35, p[0] * 0.6));
}

/**
 * The page's motion, fed in from the scroll: the wind follows it, and while
 * you're moving fast the atmospheric cues hold off.
 */
export function flow(velocity: number) {
  if (!on || !ctx || !bed) return;
  const v = Math.min(1, Math.abs(velocity) / 45);
  const t = ctx.currentTime;
  bed.windGain.gain.setTargetAtTime(0.004 + v * 0.05, t, v > 0.05 ? 0.12 : 0.6);
  bed.windFilter.frequency.setTargetAtTime(420 + v * 1100, t, 0.25);
  if (v > 0.45) rushingUntil = performance.now() + 700;
}

/** a heart, at so many beats a second; 0 stops it */
export function heart(rate: number) {
  heartRateNow = rate;
  window.clearTimeout(heartTimer);
  if (!rate || !on) return;
  const tick = () => {
    if (!heartRateNow || !on) return;
    cue("beat", true);
    heartTimer = window.setTimeout(tick, 1000 / heartRateNow);
  };
  tick();
}

// --- the cues -----------------------------------------------------------------------

/** how long each must wait before it can happen again, in seconds */
const COOLDOWN: Partial<Record<Cue, number>> = {
  tick: 0.06,
  inhale: 1.6,
  toll: 3,
  thud: 0.8,
  hit: 1,
  slam: 2,
  scare: 4,
  meow: 2.5,
  hiss: 1.5,
  growl: 3,
  whisper: 2.5,
  creak: 3,
  thunder: 5,
  musicbox: 12,
  beep: 1,
  vine: 2,
};
/** the ones that are only atmosphere: they don't happen while you're rushing through */
const AIR = new Set<Cue>(["inhale", "toll", "whisper", "creak", "musicbox"]);
/** the ones that would drown each other: one at a time */
const BIG = new Set<Cue>(["toll", "hit", "slam", "scare", "meow", "growl", "thunder"]);
const last: Partial<Record<Cue, number>> = {};
let lastBig = -10;

/**
 * Plays one, if it's its turn. `force` is for the moments the page is built
 * around (a scare, waking it) — they always happen.
 */
export function cue(name: Cue, force = false) {
  if (!on || !ctx || !master || ctx.state !== "running") return;
  const now = ctx.currentTime;
  if (!force) {
    if (now - (last[name] ?? -100) < (COOLDOWN[name] ?? 0)) return;
    if (AIR.has(name) && performance.now() < rushingUntil) return;
    if (BIG.has(name) && now - lastBig < 1.4) return;
  }
  last[name] = now;
  if (BIG.has(name)) lastBig = now;
  play(ctx, name, now + 0.01);
}

// --- the voice -------------------------------------------------------------------

/**
 * The lines said out loud — the only recordings in the score: ElevenLabs
 * voices, trimmed, levelled and squeezed to small mono AAC (the takes as
 * they came, kept or not, are in design/voice/). They're fetched once the
 * sound's turned on, so nobody who leaves it off ever downloads them.
 */
export type Line =
  // the cards between acts (Cut.tsx), in the order they come up
  | "presents"
  | "shh"
  | "hear"
  | "wrong-way"
  | "lights-off"
  | "eyes-open"
  | "breathing"
  | "so-soon"
  | "followed"
  | "made-it"
  | "most-dont"
  | "when-it-drops"
  | "back-for-more"
  // and the jokes
  | "damage"
  | "what"
  | "safe"
  | "nerd"
  | "leaving"
  | "banner";

/** how loud each sits, how much of it goes into the room, and which side it's on */
const LINES: Record<Line, { level: number; wet: number; pan?: number }> = {
  // the studio card, read the way a trailer's is
  presents: { level: 0.8, wet: 0.25 },
  // something in the dark, whispering — close, at one shoulder…
  shh: { level: 0.75, wet: 0.35, pan: -0.35 },
  hear: { level: 0.8, wet: 0.3, pan: -0.35 },
  "lights-off": { level: 0.8, wet: 0.3, pan: -0.35 },
  "eyes-open": { level: 0.8, wet: 0.3, pan: -0.35 },
  breathing: { level: 0.8, wet: 0.3, pan: -0.35 },
  "most-dont": { level: 0.8, wet: 0.3, pan: -0.35 },
  "when-it-drops": { level: 0.8, wet: 0.3, pan: -0.35 },
  // …and at the other one, once you've turned round
  "wrong-way": { level: 0.8, wet: 0.3, pan: 0.35 },
  "so-soon": { level: 0.8, wet: 0.3, pan: 0.35 },
  followed: { level: 0.8, wet: 0.3, pan: 0.35 },
  "back-for-more": { level: 0.8, wet: 0.3, pan: 0.35 },
  // and something that thinks it's all very funny
  "made-it": { level: 0.8, wet: 0.15 },
  damage: { level: 0.85, wet: 0.15 },
  // (what anyone says when the face comes at them, before it laughs)
  what: { level: 0.85, wet: 0.12 },
  safe: { level: 0.75, wet: 0.18 },
  nerd: { level: 0.7, wet: 0.12 },
  leaving: { level: 0.7, wet: 0.15 },
  banner: { level: 0.7, wet: 0.15 },
};

const clips = new Map<Line, AudioBuffer>();
let fetched = false;
const spoken = new Set<Line>();
let talkingUntil = 0;

function fetchLines(c: AudioContext) {
  if (fetched) return;
  fetched = true;
  for (const line of Object.keys(LINES) as Line[]) {
    fetch(`/sounds/${line}.m4a`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`))))
      .then((data) => c.decodeAudioData(data))
      .then((clip) => clips.set(line, clip))
      .catch(() => {
        // that line just goes unsaid
      });
  }
}

/** how long `say(line)` would take if it were said now, in seconds — 0 if it wouldn't be */
export function lineLength(line: Line): number {
  if (!on || !ctx || ctx.state !== "running" || spoken.has(line)) return 0;
  return clips.get(line)?.duration ?? 0;
}

/**
 * Says one of the lines, `delay` seconds from now: once a visit, never over
 * another line, and only with the sound on. Returns how long from now until
 * it's said, in seconds, so a moment can land on the end of it — or 0, if it
 * isn't going to be.
 */
export function say(line: Line, delay = 0): number {
  if (!on || !ctx || !master || ctx.state !== "running" || spoken.has(line)) return 0;
  const clip = clips.get(line);
  const t = ctx.currentTime + 0.01 + delay;
  if (!clip || t < talkingUntil) return 0;
  spoken.add(line);
  talkingUntil = t + clip.duration;
  const { level, wet, pan = 0 } = LINES[line];
  const src = ctx.createBufferSource();
  src.buffer = clip;
  const side = ctx.createStereoPanner();
  side.pan.value = pan;
  src.connect(side).connect(bus(ctx, level, wet));
  src.start(t);
  // the bed steps back while it talks, and comes back after
  for (const [out, full] of bed?.outs ?? []) {
    out.gain.cancelScheduledValues(t);
    out.gain.setTargetAtTime(full * 0.3, t, 0.05);
    out.gain.setTargetAtTime(full, t + clip.duration, 0.45);
  }
  return t - ctx.currentTime + clip.duration;
}

function play(c: AudioContext, name: Cue, t: number) {
  switch (name) {
    case "tick": {
      // a soft knock on old wood
      const s = noiseSrc(c);
      const f = band(c, 1500, 5);
      const g = c.createGain();
      env(g, t, 0.03, 0.002, 0.06);
      s.connect(f).connect(g).connect(bus(c, 1, 0.4));
      s.start(t);
      s.stop(t + 0.1);
      break;
    }
    case "beat": {
      // a heart, close and muffled: lub-dub
      for (const [at, peak] of [
        [0, 0.38],
        [0.2, 0.26],
      ] as const) {
        const o = osc(c, "sine", 58);
        o.frequency.setValueAtTime(58, t + at);
        o.frequency.exponentialRampToValueAtTime(34, t + at + 0.16);
        const g = c.createGain();
        env(g, t + at, peak, 0.01, 0.22);
        o.connect(g).connect(bus(c, 1, 0.12));
        o.start(t + at);
        o.stop(t + at + 0.3);
      }
      break;
    }
    case "inhale": {
      // something taking a breath, close by
      const s = noiseSrc(c);
      const f = band(c, 1100, 0.9);
      f.frequency.setValueAtTime(700, t);
      f.frequency.exponentialRampToValueAtTime(1600, t + 1.1);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
      s.connect(f).connect(g).connect(bus(c, 1, 0.5));
      s.start(t);
      s.stop(t + 1.3);
      break;
    }
    case "toll": {
      // a bell, a long way off — the partials of a real one, slightly wrong
      const root = 146.83;
      for (const [ratio, level, decay] of [
        [0.5, 0.05, 6],
        [1, 0.06, 5],
        [1.19, 0.035, 4],
        [1.5, 0.03, 3.5],
        [2, 0.025, 3],
        [2.52, 0.018, 2.4],
        [2.66, 0.014, 2.2],
        [3.01, 0.012, 1.8],
        [4.17, 0.008, 1.2],
      ] as const) {
        const o = osc(c, "sine", cents(root * ratio, rnd(-6, 6)));
        const g = c.createGain();
        env(g, t, level, 0.006, decay);
        o.connect(g).connect(bus(c, 1, 0.9));
        o.start(t);
        o.stop(t + decay + 0.1);
      }
      break;
    }
    case "thud":
    case "hit":
    case "slam": {
      // something heavy, close: a thud you feel more than hear
      const big = name !== "thud";
      const o = osc(c, "sine", big ? 72 : 60);
      o.frequency.exponentialRampToValueAtTime(30, t + (big ? 0.7 : 0.4));
      const g = c.createGain();
      env(g, t, big ? 0.6 : 0.4, 0.006, big ? 0.9 : 0.5);
      o.connect(g).connect(bus(c, 1, 0.3));
      o.start(t);
      o.stop(t + 1);
      const s = noiseSrc(c);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(900, t);
      f.frequency.exponentialRampToValueAtTime(80, t + 0.4);
      const ng = c.createGain();
      env(ng, t, big ? 0.2 : 0.12, 0.003, 0.4);
      s.connect(f).connect(ng).connect(bus(c, 1, 0.5));
      s.start(t);
      s.stop(t + 0.5);
      if (name === "hit") {
        // and a thin shriek over it, bending up
        const w = osc(c, "sine", 1240);
        w.frequency.exponentialRampToValueAtTime(1660, t + 0.4);
        const vib = osc(c, "sine", 9);
        const vd = c.createGain();
        vd.gain.value = 30;
        vib.connect(vd).connect(w.frequency);
        const wg = c.createGain();
        env(wg, t + 0.02, 0.06, 0.03, 0.5);
        w.connect(wg).connect(bus(c, 1, 0.7));
        w.start(t);
        vib.start(t);
        w.stop(t + 0.6);
        vib.stop(t + 0.6);
      }
      if (name === "slam") play(c, "toll", t + 0.05);
      break;
    }
    case "scare": {
      // the one meant to make you jump: high voices a semitone apart,
      // shaking, swelling in all at once — and the floor going under them
      const f = band(c, 1500, 0.7);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      f.connect(g).connect(bus(c, 1, 0.8));
      const shake = osc(c, "sine", 6.5);
      const sd = c.createGain();
      sd.gain.value = 26;
      shake.connect(sd);
      for (const hz of [1046.5, 1108.7, 1174.7, 1244.5]) {
        const o = osc(c, "sawtooth", hz);
        sd.connect(o.frequency);
        o.frequency.setValueAtTime(hz, t);
        o.frequency.exponentialRampToValueAtTime(hz * 0.88, t + 1.4);
        o.connect(f);
        o.start(t);
        o.stop(t + 1.6);
      }
      shake.start(t);
      shake.stop(t + 1.6);
      play(c, "thud", t);
      break;
    }
    case "meow":
    case "growl": {
      // a cat, and not a happy one: a yowl bent through the shape of a mouth
      // opening and closing, rough with a growl underneath
      const angry = name === "meow";
      const long = angry ? 1.25 : 1.9;
      const src = osc(c, "sawtooth", angry ? 380 : 90);
      if (angry) {
        src.frequency.setValueAtTime(360, t);
        src.frequency.linearRampToValueAtTime(640, t + 0.38);
        src.frequency.linearRampToValueAtTime(560, t + 0.8);
        src.frequency.linearRampToValueAtTime(330, t + long);
      } else {
        src.frequency.setValueAtTime(88, t);
        src.frequency.linearRampToValueAtTime(70, t + long);
      }
      const vib = osc(c, "sine", angry ? 6 : 4);
      const vd = c.createGain();
      vd.gain.value = angry ? 14 : 4;
      vib.connect(vd).connect(src.frequency);
      // the growl: the whole voice fluttering
      const rough = osc(c, "sine", angry ? 32 : 24);
      const rd = c.createGain();
      rd.gain.value = 0.45;
      const voice = c.createGain();
      voice.gain.value = 0.55;
      rough.connect(rd).connect(voice.gain);
      // the mouth: two formants that open toward "aa" and close toward "oo"
      const f1 = band(c, angry ? 650 : 300, 5);
      const f2 = band(c, angry ? 1500 : 700, 7);
      if (angry) {
        f1.frequency.setValueAtTime(520, t);
        f1.frequency.linearRampToValueAtTime(980, t + 0.4);
        f1.frequency.linearRampToValueAtTime(480, t + long);
        f2.frequency.setValueAtTime(1800, t);
        f2.frequency.linearRampToValueAtTime(1350, t + 0.5);
        f2.frequency.linearRampToValueAtTime(850, t + long);
      }
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(angry ? 0.24 : 0.2, t + 0.09);
      g.gain.setTargetAtTime(angry ? 0.18 : 0.16, t + 0.3, 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + long);
      src.connect(voice);
      voice.connect(f1).connect(g);
      voice.connect(f2).connect(g);
      // breath through the same mouth
      const air = noiseSrc(c);
      const ag = c.createGain();
      ag.gain.value = angry ? 0.1 : 0.06;
      air.connect(ag);
      ag.connect(f1);
      ag.connect(f2);
      g.connect(bus(c, 1, 0.55));
      for (const n of [src, vib, rough]) {
        n.start(t);
        n.stop(t + long + 0.1);
      }
      air.start(t);
      air.stop(t + long + 0.1);
      break;
    }
    case "hiss": {
      // the warning before it
      const s = noiseSrc(c);
      const hp = c.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 2600;
      const f = band(c, 5200, 1.2);
      const flutter = osc(c, "sine", 21);
      const fd = c.createGain();
      fd.gain.value = 0.05;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      flutter.connect(fd).connect(g.gain);
      s.connect(hp).connect(f).connect(g).connect(bus(c, 1, 0.4));
      s.start(t);
      flutter.start(t);
      s.stop(t + 0.9);
      flutter.stop(t + 0.9);
      break;
    }
    case "whisper": {
      // a few breaths of something saying something, off to one side
      const pan = c.createStereoPanner();
      pan.pan.value = rnd(-0.9, 0.9);
      pan.connect(bus(c, 1, 0.7));
      let at = t;
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const dur = rnd(0.14, 0.32);
        const s = noiseSrc(c);
        const f = band(c, rnd(2400, 4000), rnd(2, 4));
        const g = c.createGain();
        env(g, at, 0.03, dur * 0.3, dur * 0.7);
        s.connect(f).connect(g).connect(pan);
        s.start(at);
        s.stop(at + dur + 0.05);
        at += dur + rnd(0.05, 0.14);
      }
      break;
    }
    case "creak": {
      // a floorboard, somewhere you can't see
      const o = osc(c, "sawtooth", 95);
      let at = t;
      for (let i = 0; i < 36; i++) {
        o.frequency.setValueAtTime(rnd(70, 140), at);
        at += rnd(0.014, 0.034);
      }
      const f = band(c, 850, 7);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, at);
      const pan = c.createStereoPanner();
      pan.pan.value = rnd(-0.8, 0.8);
      o.connect(f).connect(g).connect(pan).connect(bus(c, 1, 0.7));
      o.start(t);
      o.stop(at + 0.05);
      break;
    }
    case "thunder": {
      // far off, more felt than heard
      for (const [cut, peak, long] of [
        [700, 0.18, 1.8],
        [140, 0.3, 4],
      ] as const) {
        const s = noiseSrc(c);
        const f = c.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = cut;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.05);
        g.gain.setTargetAtTime(peak * 0.4, t + 0.2, 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, t + long);
        s.connect(f).connect(g).connect(bus(c, 1, 0.7));
        s.start(t);
        s.stop(t + long + 0.1);
      }
      break;
    }
    case "vine": {
      // the meme: one deep, round boom
      const o = osc(c, "sine", 82);
      o.frequency.setValueAtTime(82, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.55);
      const g = c.createGain();
      env(g, t, 0.55, 0.004, 0.7);
      const d = c.createWaveShaper();
      const curve = new Float32Array(512);
      for (let i = 0; i < 512; i++) {
        const x = (i / 511) * 2 - 1;
        curve[i] = Math.tanh(x * 2.2);
      }
      d.curve = curve;
      o.connect(d).connect(g).connect(bus(c, 1, 0.35));
      o.start(t);
      o.stop(t + 0.8);
      break;
    }
    case "beep": {
      // the censor
      const o = osc(c, "sine", 1000);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
      g.gain.setValueAtTime(0.07, t + 0.42);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);
      o.connect(g).connect(bus(c, 1, 0.15));
      o.start(t);
      o.stop(t + 0.5);
      break;
    }
    case "musicbox": {
      // the same few notes each time, out of tune like it's been wound too
      // often; now and then it slips down a semitone
      const slip = Math.random() < 0.3 ? -100 : 0;
      const notes = [880, 698.46, 587.33, 659.26, 698.46, 659.26, 554.37, 440];
      notes.forEach((hz, i) => {
        const at = t + i * 0.46 + (i === notes.length - 1 ? 0.3 : 0);
        const base = cents(hz, slip + rnd(-16, 16));
        for (const [mult, level] of [
          [1, 0.045],
          [2, 0.012],
          [3.01, 0.006],
        ] as const) {
          const o = osc(c, "sine", base * mult);
          const g = c.createGain();
          env(g, at, level, 0.004, 1.5);
          o.connect(g).connect(bus(c, 1, 0.85));
          o.start(at);
          o.stop(at + 1.6);
        }
      });
      break;
    }
  }
}
