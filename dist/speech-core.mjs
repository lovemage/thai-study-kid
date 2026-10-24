export const normalizeThai = text => text.normalize('NFC').replace(/[\s\p{P}\p{S}\u200B-\u200D\uFEFF]/gu, '');
// Keep tones/vowels intact. A transcript match is not a pronunciation or tone score.
export function assessTranscript(text, target) {
  const value = normalizeThai(text || '');
  if (!value || !/[\u0E01-\u0E5B]/u.test(value)) return 'unclear';
  return [target.word, target.char + 'อ' + target.word, target.char + target.word]
    .map(normalizeThai).some(v => [1, 2, 3].some(n => value === v.repeat(n))) ? 'match' : 'retry';
}
export function resample(channels, rate) {
  const n = Math.min(channels[0].length, Math.floor(rate * 6.5));
  const mono = new Float32Array(n);
  for (const channel of channels) for (let i = 0; i < n; i++) mono[i] += channel[i] / channels.length;
  const out = new Float32Array(Math.floor(n * 16000 / rate));
  // Average each input interval to reduce aliasing while downsampling.
  for (let i = 0; i < out.length; i++) {
    const start = i * rate / 16000, end = Math.min(n, (i + 1) * rate / 16000);
    let sum = 0;
    for (let j = Math.floor(start); j < Math.ceil(end); j++) sum += mono[j] * (Math.min(end,j+1)-Math.max(start,j));
    out[i] = sum / (end - start);
  }
  return out;
}
export function isQuiet(audio) {
  if (audio.length < 4000) return true;
  let sum=0,active=0;
  for(const x of audio){sum+=x*x;if(Math.abs(x)>.012)active++}
  return Math.sqrt(sum/audio.length)<.003 || active<960;
}
