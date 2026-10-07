// The loop the story draws and the pads play, in the song's key (B major):
// Emaj7, D#7, G#m9, C#/E#, F#m7, B7. The last two are a ii-V that leads back to Emaj7.

/** One chord per bar: the bass, then the right hand, as MIDI note numbers. */
export const VOICINGS: readonly (readonly number[])[] = [
  [40, 56, 59, 63],
  [39, 55, 58, 61],
  [44, 56, 58, 59, 63, 66],
  [41, 56, 61, 65],
  [42, 57, 61, 64],
  [47, 57, 63, 66],
];

const pc = (midi: number) => ((midi % 12) + 12) % 12;

/** B major: B, C#, D#, E, F#, G#, A#. */
const B_MAJOR = new Set([11, 1, 3, 4, 6, 8, 10]);
export const inKey = (midi: number) => B_MAJOR.has(pc(midi));

/** Whether a note is one of the chord's own tones, in any octave. */
export const inChord = (midi: number, chord: readonly number[]) => chord.some((m) => pc(m) === pc(midi));

/** The note this site keeps coming back to: G, written F double sharp, the third of D#7. */
export const ODD_NOTE = 67;
