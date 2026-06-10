let _actx = null;

const getCtx = () => {
  if (!_actx) _actx = new AudioContext();
  return _actx;
};

const tone = (frequency, duration, type = 'square', endFreq = null) => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (endFreq !== null) {
    osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
  }
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

export const playSound = (type) => {
  try {
    if (type === 'left') tone(200, 0.08);
    else if (type === 'right') tone(350, 0.08);
    else if (type === 'jump') tone(300, 0.15, 'sine', 600);
  } catch (_) {
    // AudioContext not available — silently skip
  }
};
