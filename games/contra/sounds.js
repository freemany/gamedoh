let _actx = null;
const getCtx = () => { if (!_actx) _actx = new AudioContext(); return _actx; };

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
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
};

export const playSound = (type) => {
  if (type === 'shoot') tone(800, 400, 0.08);
  if (type === 'jump')  tone(300, 500, 0.15, 'sine');
  if (type === 'hit')   tone(200, 100, 0.15);
  if (type === 'death') tone(400, 80,  0.4, 'sine');
};
