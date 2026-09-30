// A small FM electric piano on the Web Audio API. No samples, no network.
// Two operator pairs per note: a 1:1 pair for the body and a 1:14 pair for the tine's bell.

type Voice = { out: GainNode; oscs: OscillatorNode[] };

export type Engine = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  play: (notes: readonly number[]) => void;
};

let engine: Engine | null = null;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function impulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const n = Math.random() * 2 - 1;
      lp = lp * 0.55 + n * 0.45;
      d[i] = lp * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

function voice(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  t0: number,
  vel: number,
  level: number,
): Voice {
  const dur = 3.6;
  const out = ctx.createGain();
  out.gain.value = level;
  const k = 1 / (1 + freq / 900); // calmer modulation in the treble

  // Body: carrier and modulator at the same frequency.
  const c1 = ctx.createOscillator();
  c1.frequency.value = freq;
  const m1 = ctx.createOscillator();
  m1.frequency.value = freq;
  const i1 = ctx.createGain();
  i1.gain.setValueAtTime(freq * 1.5 * vel * k, t0);
  i1.gain.exponentialRampToValueAtTime(freq * 0.16 * k + 0.01, t0 + 1.5);
  m1.connect(i1).connect(c1.frequency);
  const a1 = ctx.createGain();
  a1.gain.setValueAtTime(0.0001, t0);
  a1.gain.exponentialRampToValueAtTime(0.9 * vel, t0 + 0.006);
  a1.gain.exponentialRampToValueAtTime(0.3 * vel, t0 + 0.55);
  a1.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  c1.connect(a1).connect(out);

  // Tine: a short, bright attack from a 14x modulator.
  const c2 = ctx.createOscillator();
  c2.frequency.value = freq;
  const m2 = ctx.createOscillator();
  m2.frequency.value = freq * 14;
  const i2 = ctx.createGain();
  i2.gain.setValueAtTime(freq * 0.85 * k, t0);
  i2.gain.exponentialRampToValueAtTime(0.01, t0 + 0.2);
  m2.connect(i2).connect(c2.frequency);
  const a2 = ctx.createGain();
  a2.gain.setValueAtTime(0.0001, t0);
  a2.gain.exponentialRampToValueAtTime(0.2 * vel, t0 + 0.003);
  a2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
  c2.connect(a2).connect(out);

  out.connect(dest);
  const oscs = [c1, m1, c2, m2];
  for (const o of oscs) {
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  c1.onended = () => out.disconnect();
  return { out, oscs };
}

export function getEngine(): Engine {
  if (engine) return engine;

  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC({ latencyHint: "interactive" });

  // Let iOS play through the silent switch, like a music app would.
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  try {
    if (nav.audioSession) nav.audioSession.type = "playback";
  } catch {
    /* not supported */
  }

  const bus = ctx.createGain();
  bus.gain.value = 0.9;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 6200;
  tone.Q.value = 0.4;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.25;
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 2.2, 3.4);
  const wet = ctx.createGain();
  wet.gain.value = 0.22;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0;

  bus.connect(tone);
  tone.connect(comp);
  tone.connect(reverb);
  reverb.connect(wet);
  wet.connect(comp);
  comp.connect(ctx.destination);
  comp.connect(analyser);

  let held: Voice[] = [];

  const play = (notes: readonly number[]) => {
    if (ctx.state !== "running") void ctx.resume();
    const now = ctx.currentTime + 0.005;

    // Changing chords lifts the dampers on the previous one.
    for (const v of held) {
      v.out.gain.cancelScheduledValues(now);
      v.out.gain.setValueAtTime(v.out.gain.value, now);
      v.out.gain.setTargetAtTime(0.0001, now, 0.09);
      for (const o of v.oscs) {
        try {
          o.stop(now + 0.7);
        } catch {
          /* already stopped */
        }
      }
    }
    held = [];

    // Roll the chord slightly, bass first, like a hand does.
    const perNote = 0.17;
    notes.forEach((m, i) => {
      const t0 = now + i * 0.011 + Math.random() * 0.004;
      const vel = (i === 0 ? 0.95 : 0.8) * (0.94 + Math.random() * 0.08);
      held.push(voice(ctx, bus, mtof(m), t0, vel, perNote));
    });
  };

  engine = { ctx, analyser, play };
  return engine;
}
