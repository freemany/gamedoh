let _actx = null;
const getCtx = () => {
  if (!_actx) _actx = new AudioContext();
  return _actx;
};

const tone = (freq, endFreq, duration, type = 'square') => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq !== null)
      osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
};

export const playSound = (type) => {
  if (type === 'rotate') tone(220, 260,  0.06, 'sine');
  if (type === 'drop')   tone(180, 120,  0.08, 'square');
  if (type === 'clear')  tone(440, 660,  0.15, 'sine');
  if (type === 'tetris') {
    // 4-note fanfare
    tone(523, 523, 0.1,  'sine');
    setTimeout(() => tone(659, 659, 0.1,  'sine'), 110);
    setTimeout(() => tone(784, 784, 0.1,  'sine'), 220);
    setTimeout(() => tone(1047, 1047, 0.2, 'sine'), 330);
  }
};
