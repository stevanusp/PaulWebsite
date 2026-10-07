// A Rhodes-style electric piano on the Web Audio API. No samples, no network.
//
// Per note: a 1:1 FM pair for the tone bar and tine (its index jumps with velocity, which is the
// bark of a key played hard, then mellows), a 1:14 pair for the short metallic ping of the tine, and
// a little second harmonic for the pickup's growl. Low notes ring longer than high ones.
// On the bus: a soft, slightly lopsided drive like an amp, a warm low-pass, and the stereo tremolo
// of a Suitcase Rhodes, then a small room.

type Voice = { out: GainNode; oscs: OscillatorNode[] };

export type Engine = {
  ctx: AudioContext;
  /** With `keep`, the chord already ringing is not damped, so the new notes sound on top of it. */
  play: (notes: readonly number[], opts?: { keep?: boolean }) => void;
};

let engine: Engine | null = null;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function impulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const n = Math.random() * 2 - 1;
      lp = lp * 0.6 + n * 0.4;
      d[i] = lp * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

/** Soft clipping that leans a little to one side, so it adds even harmonics like a tube does. */
function driveCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 2048;
  const curve = new Float32Array(n);
  const norm = Math.tanh(amount * 1.12);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(amount * (x + 0.12 * x * x)) / norm;
  }
  return curve;
}

function voice(ctx: AudioContext, dest: AudioNode, freq: number, t0: number, vel: number, level: number): Voice {
  // Low notes sustain for seconds, high ones fade sooner.
  const tau = clamp(1.9 * Math.pow(220 / freq, 0.4), 0.55, 3.2);
  const dur = Math.min(8, 0.4 + tau * 4);
  const k = 1 / (1 + freq / 1100); // calmer modulation in the treble
  const out = ctx.createGain();
  out.gain.value = level;

  // Tone bar and tine: the index starts high with velocity (bark) and settles (bell, then mellow).
  const c1 = ctx.createOscillator();
  c1.frequency.value = freq;
  const m1 = ctx.createOscillator();
  m1.frequency.value = freq;
  const i1 = ctx.createGain();
  i1.gain.setValueAtTime(freq * (0.55 + 2.1 * vel * vel) * k, t0);
  i1.gain.setTargetAtTime(freq * (0.22 + 0.25 * vel) * k, t0, 0.2);
  i1.gain.setTargetAtTime(freq * 0.1 * k, t0 + 0.8, 1.6);
  m1.connect(i1).connect(c1.frequency);
  const a1 = ctx.createGain();
  a1.gain.setValueAtTime(0, t0);
  a1.gain.linearRampToValueAtTime(vel, t0 + 0.002);
  a1.gain.setTargetAtTime(0.55 * vel, t0 + 0.002, 0.16);
  a1.gain.setTargetAtTime(0.0001, t0 + 0.4, tau);
  c1.connect(a1).connect(out);

  // The tine's ping: bright, metallic, gone in a moment.
  const c2 = ctx.createOscillator();
  c2.frequency.value = freq;
  const m2 = ctx.createOscillator();
  m2.frequency.value = freq * 14;
  const i2 = ctx.createGain();
  i2.gain.setValueAtTime(freq * 0.7 * k, t0);
  i2.gain.setTargetAtTime(0.01, t0, 0.035);
  m2.connect(i2).connect(c2.frequency);
  const a2 = ctx.createGain();
  a2.gain.setValueAtTime(0, t0);
  a2.gain.linearRampToValueAtTime(0.13 * vel * k + 0.02, t0 + 0.0015);
  a2.gain.setTargetAtTime(0.0001, t0 + 0.0015, 0.09);
  c2.connect(a2).connect(out);

  // The pickup's growl: a touch of the octave above, more of it when played hard.
  const h2 = ctx.createOscillator();
  h2.frequency.value = freq * 2;
  const a3 = ctx.createGain();
  a3.gain.setValueAtTime(0, t0);
  a3.gain.linearRampToValueAtTime(0.16 * Math.pow(vel, 1.5) * k, t0 + 0.003);
  a3.gain.setTargetAtTime(0.0001, t0 + 0.003, 0.35);
  h2.connect(a3).connect(out);

  out.connect(dest);
  const oscs = [c1, m1, c2, m2, h2];
  for (const o of oscs) {
    o.start(t0);
    o.stop(t0 + dur);
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
  bus.gain.value = 0.85;

  // A gentle amp: a little drive, then take out the offset the lopsided curve leaves.
  const drive = ctx.createWaveShaper();
  drive.curve = driveCurve(1.5);
  drive.oversample = "2x";
  const dc = ctx.createBiquadFilter();
  dc.type = "highpass";
  dc.frequency.value = 35;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 3900;
  tone.Q.value = 0.5;

  // Suitcase tremolo: the sound swings between the speakers.
  const pan = ctx.createStereoPanner();
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 4.6;
  const depth = ctx.createGain();
  depth.gain.value = 0.45;
  lfo.connect(depth).connect(pan.pan);
  lfo.start();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 12;
  comp.ratio.value = 3;
  comp.attack.value = 0.005;
  comp.release.value = 0.25;
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 1.8, 3.2);
  const wet = ctx.createGain();
  wet.gain.value = 0.18;

  bus.connect(drive).connect(dc).connect(tone).connect(pan);
  pan.connect(comp);
  pan.connect(reverb);
  reverb.connect(wet).connect(comp);
  comp.connect(ctx.destination);

  let held: Voice[] = [];

  const play = (notes: readonly number[], opts?: { keep?: boolean }) => {
    if (ctx.state !== "running") void ctx.resume();
    const now = ctx.currentTime + 0.005;

    // Changing chords lets the dampers back down on the previous one.
    for (const v of opts?.keep ? [] : held) {
      v.out.gain.cancelScheduledValues(now);
      v.out.gain.setValueAtTime(v.out.gain.value, now);
      v.out.gain.setTargetAtTime(0.0001, now, 0.07);
      for (const o of v.oscs) {
        try {
          o.stop(now + 0.6);
        } catch {
          /* already stopped */
        }
      }
    }
    if (!opts?.keep) held = [];

    // Roll the chord slightly, bass first, like a hand does.
    const perNote = notes.length > 4 ? 0.13 : 0.16;
    notes.forEach((m, i) => {
      const t0 = now + i * 0.012 + Math.random() * 0.004;
      const vel = (i === 0 ? 0.86 : 0.74) * (0.93 + Math.random() * 0.1);
      held.push(voice(ctx, bus, mtof(m), t0, vel, perNote));
    });
  };

  engine = { ctx, play };
  return engine;
}
