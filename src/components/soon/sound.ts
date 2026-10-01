"use client";

/**
 * The teaser's sound, made in the browser — no audio files to download.
 *
 * Off until the visitor turns it on (browsers won't play anything before a
 * tap anyway, and a page that starts making noise by itself gets closed).
 * Nothing is remembered between visits: it starts off every time.
 *
 * One quiet bed of sound — a low hum with air moving through it — that
 * darkens in the dark room, and a handful of cues the sections fire: a
 * heartbeat for the countdown, a hit for JUMP, a growl when it wakes, the
 * scare. Every cue is a few oscillators and a noise burst with an envelope,
 * so firing one costs next to nothing, and all of it stops when the tab
 * isn't being looked at.
 */

export type Cue = "thump" | "hit" | "scare" | "wake" | "tick" | "whoosh" | "slam";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bed: { filter: BiquadFilterNode; gain: GainNode } | null = null;
let noise: AudioBuffer | null = null;
let on = false;
const listeners = new Set<(on: boolean) => void>();

export const soundOn = () => on;

export function subscribeSound(fn: (on: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function noiseBuffer(c: AudioContext) {
  if (noise) return noise;
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noise = b;
  return b;
}

/** the bed: two detuned low tones beating against each other, and air */
function startBed(c: AudioContext, out: GainNode) {
  const gain = c.createGain();
  gain.gain.value = 0.055;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.7;
  filter.connect(gain).connect(out);
  for (const [f, type, level] of [
    [49, "triangle", 1],
    [49.6, "triangle", 0.9],
    [98.3, "sine", 0.35],
  ] as const) {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = c.createGain();
    g.gain.value = level;
    o.connect(g).connect(filter);
    o.start();
  }
  // a slow breath in the filter
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const depth = c.createGain();
  depth.gain.value = 140;
  lfo.connect(depth).connect(filter.frequency);
  lfo.start();
  // air
  const air = c.createBufferSource();
  air.buffer = noiseBuffer(c);
  air.loop = true;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 520;
  band.Q.value = 0.5;
  const airGain = c.createGain();
  airGain.gain.value = 0.012;
  air.connect(band).connect(airGain).connect(out);
  air.start();
  return { filter, gain };
}

export async function setSound(next: boolean) {
  if (typeof window === "undefined") return;
  if (next) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    await ctx.resume();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      bed = startBed(ctx, master);
      document.addEventListener("visibilitychange", () => {
        if (!ctx) return;
        if (document.hidden) void ctx.suspend();
        else if (on) void ctx.resume();
      });
    }
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.5);
  } else if (ctx && master) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    window.setTimeout(() => {
      if (!on) void ctx?.suspend();
    }, 600);
  }
  on = next;
  for (const fn of listeners) fn(on);
}

/** 0 is the cream rooms, 1 is the dark one: the bed closes in and swells */
export function mood(level: number) {
  if (!ctx || !bed) return;
  const t = ctx.currentTime;
  bed.filter.frequency.setTargetAtTime(420 - level * 260, t, 0.6);
  bed.gain.gain.setTargetAtTime(0.055 + level * 0.05, t, 0.6);
}

/** a tone with an envelope, sliding from one pitch to another */
function tone(c: AudioContext, out: AudioNode, type: OscillatorType, from: number, to: number, start: number, dur: number, level: number) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, start);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(level, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(out);
  o.start(start);
  o.stop(start + dur + 0.05);
}

/** a burst of noise through a filter */
function burst(c: AudioContext, out: AudioNode, type: BiquadFilterType, from: number, to: number, start: number, dur: number, level: number) {
  const s = c.createBufferSource();
  s.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(from, start);
  f.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(level, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  s.connect(f).connect(g).connect(out);
  s.start(start);
  s.stop(start + dur + 0.05);
}

export function cue(name: Cue) {
  if (!on || !ctx || !master || ctx.state !== "running") return;
  const c = ctx;
  const out = master;
  const t = c.currentTime + 0.01;
  switch (name) {
    case "thump":
      // lub-dub
      tone(c, out, "sine", 70, 38, t, 0.22, 0.75);
      tone(c, out, "sine", 64, 36, t + 0.24, 0.2, 0.5);
      break;
    case "hit":
      burst(c, out, "lowpass", 2400, 200, t, 0.35, 0.45);
      tone(c, out, "sine", 110, 32, t, 0.6, 0.8);
      tone(c, out, "square", 220, 60, t, 0.12, 0.08);
      break;
    case "slam":
      burst(c, out, "lowpass", 1600, 120, t, 0.5, 0.4);
      tone(c, out, "sine", 90, 28, t, 0.9, 0.85);
      break;
    case "wake": {
      // a growl: low, rough, wobbling
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = 62;
      const wob = c.createOscillator();
      wob.frequency.value = 17;
      const wobDepth = c.createGain();
      wobDepth.gain.value = 7;
      wob.connect(wobDepth).connect(o.frequency);
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 380;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(f).connect(g).connect(out);
      o.start(t);
      wob.start(t);
      o.stop(t + 1.9);
      wob.stop(t + 1.9);
      burst(c, out, "lowpass", 600, 80, t, 1.2, 0.12);
      break;
    }
    case "scare":
      // the one loud thing: a screech sliding down over a boom — loud, not painful
      burst(c, out, "highpass", 900, 3000, t, 0.5, 0.32);
      for (const d of [0, 9, -13]) tone(c, out, "sawtooth", 1100 + d * 10, 160, t, 0.7, 0.11);
      tone(c, out, "sine", 120, 30, t, 1.1, 0.7);
      break;
    case "tick":
      tone(c, out, "sine", 1900, 1500, t, 0.05, 0.04);
      break;
    case "whoosh":
      burst(c, out, "bandpass", 260, 2600, t, 0.55, 0.16);
      break;
  }
}
