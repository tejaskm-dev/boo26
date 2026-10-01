"use client";

/**
 * The teaser's score, made in the browser — no audio files to download.
 *
 * Off until the visitor turns it on (browsers won't play anything before a
 * tap anyway, and a page that starts making noise by itself gets closed).
 * Nothing is remembered between visits: it starts off every time.
 *
 * Everything is in one key — D minor, leaning on the C# and the G# for
 * unease — and everything goes through the same room (one reverb), so the
 * cues sound like parts of one score rather than noises. Underneath it all
 * a low drone that never quite settles; on top of that, per scene
 * (`scene()`): a detuned music box in the cream rooms, whispers in the dark
 * one, a heart that speeds up on the countdown. The cues are the hits: the
 * trailer "braam" on a cut, the screech on a scare, the stabs, the growl,
 * thunder.
 *
 * A compressor sits on the output, so the loud ones are loud without ever
 * clipping. Everything stops when the tab isn't being looked at.
 */

export type Cue =
  | "tick"
  | "thump"
  | "hit"
  | "slam"
  | "braam"
  | "riser"
  | "boom"
  | "scare"
  | "stab"
  | "wake"
  | "whisper"
  | "creak"
  | "thunder"
  | "musicbox";

export type Scene = "none" | "heard" | "room" | "point" | "finale";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let verb: ConvolverNode | null = null;
let drone: { filter: BiquadFilterNode; gain: GainNode } | null = null;
let noise: AudioBuffer | null = null;
let on = false;
let current: Scene = "none";
let loop = 0;
const listeners = new Set<(on: boolean) => void>();

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

/** a room: three seconds of decaying noise, in stereo */
function impulse(c: AudioContext, seconds = 3.2, decay = 2.6) {
  const len = Math.floor(c.sampleRate * seconds);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return b;
}

/** soft clipping, for grit */
function drive(c: AudioContext, amount: number) {
  const ws = c.createWaveShaper();
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount);
  }
  ws.curve = curve;
  return ws;
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

/** an envelope on a gain: up fast, then away */
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

// --- the bed -------------------------------------------------------------------

/** a low D that never settles, a fifth over it, and something whistling far off */
function startDrone(c: AudioContext) {
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 360;
  filter.Q.value = 0.9;
  const gain = c.createGain();
  gain.gain.value = 0.5;
  filter.connect(gain);
  gain.connect(master!);
  if (verb) {
    const s = c.createGain();
    s.gain.value = 0.35;
    gain.connect(s).connect(verb);
  }
  for (const [hz, type, level] of [
    [36.71, "sawtooth", 0.16],
    [cents(36.71, 7), "sawtooth", 0.1],
    [55, "triangle", 0.14],
    [73.42, "sine", 0.07],
  ] as const) {
    const o = osc(c, type, hz);
    const g = c.createGain();
    g.gain.value = level;
    o.connect(g).connect(filter);
    o.start();
  }
  // the filter breathes, slowly, unevenly
  for (const [rate, depth] of [
    [0.05, 90],
    [0.013, 60],
  ] as const) {
    const l = osc(c, "sine", rate);
    const d = c.createGain();
    d.gain.value = depth;
    l.connect(d).connect(filter.frequency);
    l.start();
  }
  // a far whistle, a tritone up, swelling in and out
  const w = osc(c, "sine", 1661.2);
  const vib = osc(c, "sine", 4.6);
  const vibDepth = c.createGain();
  vibDepth.gain.value = 9;
  vib.connect(vibDepth).connect(w.frequency);
  const wg = c.createGain();
  wg.gain.value = 0;
  const swell = osc(c, "sine", 0.031);
  const swellDepth = c.createGain();
  swellDepth.gain.value = 0.006;
  swell.connect(swellDepth).connect(wg.gain);
  w.connect(wg);
  if (verb) wg.connect(verb);
  w.start();
  vib.start();
  swell.start();
  // air in the room
  const air = noiseSrc(c);
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 700;
  band.Q.value = 0.4;
  const ag = c.createGain();
  ag.gain.value = 0.012;
  air.connect(band).connect(ag);
  if (verb) ag.connect(verb);
  air.start();
  return { filter, gain };
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
      comp.threshold.value = -16;
      comp.knee.value = 8;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;
      comp.connect(ctx.destination);
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(comp);
      verb = ctx.createConvolver();
      verb.buffer = impulse(ctx);
      const ret = ctx.createGain();
      ret.gain.value = 0.6;
      verb.connect(ret).connect(master);
      drone = startDrone(ctx);
      document.addEventListener("visibilitychange", () => {
        if (!ctx) return;
        if (document.hidden) void ctx.suspend();
        else if (on) void ctx.resume();
      });
    }
    master.gain.setTargetAtTime(0.85, ctx.currentTime, 0.6);
    on = true;
    applyScene(current, true);
  } else if (ctx && master) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    on = false;
    window.clearTimeout(loop);
    window.setTimeout(() => {
      if (!on) void ctx?.suspend();
    }, 600);
  }
  for (const fn of listeners) fn(on);
}

/** which part of the page you're in: the bed and what plays over it follow */
export function scene(next: Scene) {
  if (next === current) return;
  current = next;
  applyScene(next, false);
}

function applyScene(s: Scene, fresh: boolean) {
  if (!on || !ctx || !drone) return;
  const t = ctx.currentTime;
  const dark = s === "room" ? 1 : s === "point" ? 0.55 : s === "finale" ? 0.35 : 0.15;
  drone.filter.frequency.setTargetAtTime(440 - dark * 300, t, 0.9);
  drone.gain.gain.setTargetAtTime(0.42 + dark * 0.3, t, 0.9);
  window.clearTimeout(loop);
  const every = (min: number, max: number, play: () => void) => {
    const go = () => {
      if (!on || current !== s) return;
      if (!document.hidden) play();
      loop = window.setTimeout(go, rnd(min, max));
    };
    loop = window.setTimeout(go, fresh ? 1200 : rnd(min * 0.3, min * 0.6));
  };
  if (s === "heard" || s === "finale") every(9000, 14000, () => cue("musicbox"));
  else if (s === "room") every(7000, 13000, () => cue(Math.random() < 0.75 ? "whisper" : "creak"));
}

/** 0 is the cream rooms, 1 the dark one — kept for callers that set it directly */
export function mood(level: number) {
  scene(level > 0.5 ? "room" : current === "room" ? "none" : current);
}

// --- the cues ---------------------------------------------------------------------

/** the heart, fast or slow */
let beat = 1;
export function heartRate(rate: number) {
  beat = rate;
}

export function cue(name: Cue) {
  if (!on || !ctx || !master || ctx.state !== "running") return;
  const c = ctx;
  const t = c.currentTime + 0.01;
  switch (name) {
    case "tick": {
      // a dry knock on wood
      const s = noiseSrc(c);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 1800;
      f.Q.value = 6;
      const g = c.createGain();
      env(g, t, 0.05, 0.002, 0.05);
      s.connect(f).connect(g).connect(bus(c, 1, 0.3));
      s.start(t);
      s.stop(t + 0.1);
      break;
    }
    case "thump": {
      // lub-dub, close and muffled, quicker as `heartRate` climbs
      const gap = 0.24 / beat;
      for (const [at, peak] of [
        [0, 0.9],
        [gap, 0.6],
      ] as const) {
        const o = osc(c, "sine", 62);
        o.frequency.setValueAtTime(62, t + at);
        o.frequency.exponentialRampToValueAtTime(38, t + at + 0.16);
        const g = c.createGain();
        env(g, t + at, peak, 0.008, 0.2);
        o.connect(g).connect(bus(c, 1, 0.15));
        o.start(t + at);
        o.stop(t + at + 0.3);
        const s = noiseSrc(c);
        const f = c.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 160;
        const ng = c.createGain();
        env(ng, t + at, peak * 0.5, 0.005, 0.12);
        s.connect(f).connect(ng).connect(bus(c, 1, 0.1));
        s.start(t + at);
        s.stop(t + at + 0.2);
      }
      break;
    }
    case "braam":
    case "slam":
    case "hit": {
      // the trailer horn: a low, detuned, distorted chord that opens and closes
      const long = name === "braam" ? 2.6 : name === "slam" ? 1.8 : 1.1;
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(180, t);
      f.frequency.exponentialRampToValueAtTime(name === "hit" ? 2600 : 1700, t + 0.12);
      f.frequency.exponentialRampToValueAtTime(220, t + long);
      const g = c.createGain();
      env(g, t, name === "hit" ? 0.5 : 0.42, 0.04, long);
      const d = drive(c, 2.4);
      f.connect(d).connect(g).connect(bus(c, 1, 0.45));
      const chord = name === "hit" ? [73.42, 110, 146.83, 155.56] : [36.71, 55, 73.42, 87.31];
      for (const hz of chord) {
        for (const dc of [-9, 0, 8]) {
          const o = osc(c, "sawtooth", cents(hz, dc));
          o.connect(f);
          o.start(t);
          o.stop(t + long + 0.2);
        }
      }
      // and the floor drops
      const sub = osc(c, "sine", 55);
      sub.frequency.setValueAtTime(name === "hit" ? 80 : 55, t);
      sub.frequency.exponentialRampToValueAtTime(30, t + long * 0.7);
      const sg = c.createGain();
      env(sg, t, 0.9, 0.01, long * 0.8);
      sub.connect(sg).connect(bus(c, 1, 0.2));
      sub.start(t);
      sub.stop(t + long);
      if (name === "hit") {
        const s = noiseSrc(c);
        const nf = c.createBiquadFilter();
        nf.type = "highpass";
        nf.frequency.value = 2000;
        const ng = c.createGain();
        env(ng, t, 0.3, 0.003, 0.25);
        s.connect(nf).connect(ng).connect(bus(c, 1, 0.4));
        s.start(t);
        s.stop(t + 0.35);
      }
      break;
    }
    case "riser": {
      // something coming: a swell that pulls in, then nothing
      const s = noiseSrc(c);
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 2.5;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(4200, t + 1.2);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 1.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.22);
      s.connect(f).connect(g).connect(bus(c, 1, 0.5));
      s.start(t);
      s.stop(t + 1.3);
      const o = osc(c, "sawtooth", 140);
      o.frequency.exponentialRampToValueAtTime(cents(140, 2400), t + 1.2);
      const og = c.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.05, t + 1.15);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 1.22);
      o.connect(og).connect(bus(c, 1, 0.5));
      o.start(t);
      o.stop(t + 1.3);
      break;
    }
    case "boom": {
      const sub = osc(c, "sine", 58);
      sub.frequency.exponentialRampToValueAtTime(26, t + 1.3);
      const g = c.createGain();
      env(g, t, 1, 0.005, 1.4);
      sub.connect(g).connect(bus(c, 1, 0.4));
      sub.start(t);
      sub.stop(t + 1.5);
      const s = noiseSrc(c);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(600, t);
      f.frequency.exponentialRampToValueAtTime(60, t + 0.9);
      const ng = c.createGain();
      env(ng, t, 0.45, 0.004, 0.9);
      s.connect(f).connect(ng).connect(bus(c, 1, 0.6));
      s.start(t);
      s.stop(t + 1);
      break;
    }
    case "scare": {
      // the one that's meant to make you jump: a cluster of screeching
      // strings a semitone apart, a scream of noise over it, and the floor
      // dropping out under both — loud, but held under the compressor
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 1700;
      f.Q.value = 0.8;
      const g = c.createGain();
      env(g, t, 0.55, 0.008, 1.3);
      const d = drive(c, 3.5);
      f.connect(d).connect(g).connect(bus(c, 1, 0.55));
      const shake = osc(c, "sine", 7.5);
      const shakeDepth = c.createGain();
      shakeDepth.gain.value = 38;
      shake.connect(shakeDepth);
      for (const hz of [1244.5, 1318.5, 1396.9, 1480, 1568, 1661.2]) {
        const o = osc(c, "sawtooth", hz);
        shakeDepth.connect(o.frequency);
        o.frequency.setValueAtTime(hz, t);
        o.frequency.exponentialRampToValueAtTime(hz * 0.82, t + 1.3);
        o.connect(f);
        o.start(t);
        o.stop(t + 1.4);
      }
      shake.start(t);
      shake.stop(t + 1.4);
      const s = noiseSrc(c);
      const nf = c.createBiquadFilter();
      nf.type = "bandpass";
      nf.Q.value = 3;
      nf.frequency.setValueAtTime(2200, t);
      nf.frequency.exponentialRampToValueAtTime(3600, t + 0.8);
      const ng = c.createGain();
      env(ng, t, 0.4, 0.004, 0.9);
      s.connect(nf).connect(ng).connect(bus(c, 1, 0.5));
      s.start(t);
      s.stop(t + 1);
      const sub = osc(c, "sine", 70);
      sub.frequency.exponentialRampToValueAtTime(28, t + 0.7);
      const sg = c.createGain();
      env(sg, t, 1, 0.004, 0.9);
      sub.connect(sg).connect(bus(c, 1, 0.3));
      sub.start(t);
      sub.stop(t + 1);
      break;
    }
    case "stab": {
      // three sharp stabs, high, a semitone grinding against itself
      for (let i = 0; i < 3; i++) {
        const at = t + i * 0.14;
        const f = c.createBiquadFilter();
        f.type = "highpass";
        f.frequency.value = 900;
        const g = c.createGain();
        env(g, at, 0.32, 0.004, 0.12);
        f.connect(g).connect(bus(c, 1, 0.45));
        for (const hz of [1760, 1864.7, cents(1760, 14)]) {
          const o = osc(c, "sawtooth", hz);
          o.connect(f);
          o.start(at);
          o.stop(at + 0.16);
        }
      }
      break;
    }
    case "wake": {
      // a growl from something much bigger than you
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 320;
      f.Q.value = 2;
      const wob = osc(c, "sine", 9);
      const wobDepth = c.createGain();
      wobDepth.gain.value = 90;
      wob.connect(wobDepth).connect(f.frequency);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
      const d = drive(c, 2);
      f.connect(d).connect(g).connect(bus(c, 1, 0.4));
      for (const [hz, type] of [
        [58, "sawtooth"],
        [61.5, "sawtooth"],
        [116, "square"],
      ] as const) {
        const o = osc(c, type, hz);
        const trem = osc(c, "sine", 15);
        const tremDepth = c.createGain();
        tremDepth.gain.value = 6;
        trem.connect(tremDepth).connect(o.frequency);
        o.connect(f);
        o.start(t);
        trem.start(t);
        o.stop(t + 2.2);
        trem.stop(t + 2.2);
      }
      break;
    }
    case "whisper": {
      // a few breaths of something saying something, off to one side
      const pan = c.createStereoPanner();
      pan.pan.value = rnd(-0.85, 0.85);
      pan.connect(bus(c, 1, 0.6));
      let at = t;
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const dur = rnd(0.14, 0.34);
        const s = noiseSrc(c);
        const f = c.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = rnd(2400, 4200);
        f.Q.value = rnd(2, 4.5);
        const am = osc(c, "sine", rnd(8, 13));
        const amDepth = c.createGain();
        amDepth.gain.value = 0.03;
        const g = c.createGain();
        env(g, at, 0.06, dur * 0.3, dur * 0.7);
        am.connect(amDepth).connect(g.gain);
        s.connect(f).connect(g).connect(pan);
        s.start(at);
        am.start(at);
        s.stop(at + dur + 0.05);
        am.stop(at + dur + 0.05);
        at += dur + rnd(0.04, 0.12);
      }
      break;
    }
    case "creak": {
      // a door, or a floorboard, somewhere you can't see
      const o = osc(c, "sawtooth", 95);
      let at = t;
      for (let i = 0; i < 40; i++) {
        o.frequency.setValueAtTime(rnd(70, 150), at);
        at += rnd(0.012, 0.03);
      }
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 900;
      f.Q.value = 7;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, at);
      const pan = c.createStereoPanner();
      pan.pan.value = rnd(-0.7, 0.7);
      o.connect(f).connect(g).connect(pan).connect(bus(c, 1, 0.6));
      o.start(t);
      o.stop(at + 0.05);
      break;
    }
    case "thunder": {
      for (const [cut, peak, long] of [
        [900, 0.55, 1.6],
        [160, 0.7, 3.6],
      ] as const) {
        const s = noiseSrc(c);
        const f = c.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = cut;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
        g.gain.setTargetAtTime(peak * 0.4, t + 0.15, 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + long);
        s.connect(f).connect(g).connect(bus(c, 1, 0.6));
        s.start(t);
        s.stop(t + long + 0.1);
      }
      break;
    }
    case "musicbox": {
      // the same few notes each time, a little out of tune, like it's been
      // wound up too many times; now and then it slips down a semitone
      const slip = Math.random() < 0.3 ? -100 : 0;
      const notes = [880, 698.46, 587.33, 659.26, 698.46, 659.26, 554.37, 440];
      const step = 0.42;
      notes.forEach((hz, i) => {
        const at = t + i * step + (i === notes.length - 1 ? 0.25 : 0);
        const base = cents(hz, slip + rnd(-14, 14));
        for (const [mult, level] of [
          [1, 0.08],
          [2, 0.022],
          [3.01, 0.01],
        ] as const) {
          const o = osc(c, "sine", base * mult);
          const g = c.createGain();
          env(g, at, level, 0.004, 1.3);
          o.connect(g).connect(bus(c, 1, 0.75));
          o.start(at);
          o.stop(at + 1.4);
        }
      });
      break;
    }
  }
}
