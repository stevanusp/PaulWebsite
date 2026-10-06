// Loudness of "It's been a while", in 144 slices of the 52 s track, scaled 0 to 100.
// Measured once from the master (RMS per slice, gamma 0.6 so quiet passages still show),
// so the waveform renders on the server and costs nothing at runtime.
export const SONG_PEAKS: readonly number[] = [
  23, 28, 45, 34, 38, 38, 39, 30, 26, 43, 40, 33, 34, 40, 47, 55, 44, 41,
  41, 56, 44, 45, 45, 41, 33, 35, 57, 46, 36, 46, 43, 37, 43, 51, 51, 50,
  77, 55, 47, 52, 65, 45, 45, 61, 68, 58, 47, 47, 41, 79, 56, 61, 57, 69,
  73, 67, 62, 77, 68, 63, 56, 68, 75, 73, 64, 59, 75, 60, 59, 66, 72, 75,
  86, 69, 79, 90, 93, 91, 74, 99, 92, 92, 84, 96, 97, 94, 92, 89, 93, 98,
  95, 80, 93, 89, 98, 75, 96, 91, 92, 91, 96, 96, 94, 91, 89, 100, 100, 100,
  88, 100, 91, 90, 85, 93, 89, 89, 84, 83, 91, 90, 79, 76, 98, 97, 93, 87,
  100, 95, 97, 94, 91, 91, 89, 94, 97, 88, 94, 88, 77, 73, 46, 33, 23, 13,
];
