let _actx = null;

const getCtx = () => {
  if (!_actx) _actx = new AudioContext();
  return _actx;
};

const tone = (frequency, duration, type = 'square', endFreq = null) => {
  try {
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
  } catch (_) {}
};

let _walkInterval = null;

export const startWalking = () => {
  if (_walkInterval) return;
  const step = () => tone(90, 0.055, 'square', 60);
  step();
  _walkInterval = setInterval(step, 200);
};

export const stopWalking = () => {
  clearInterval(_walkInterval);
  _walkInterval = null;
};

export const playSound = (type) => {
  if (type === 'bomb_place') tone(120, 0.08, 'square', 80);
  else if (type === 'explode') {
    tone(180, 0.05, 'square', 80);
    tone(220, 0.3, 'sawtooth', 40);
  } else if (type === 'collect') tone(600, 0.12, 'sine', 900);
  else if (type === 'death') tone(400, 0.5, 'sine', 80);
  else if (type === 'key') {
    tone(500, 0.1, 'sine', 700);
    setTimeout(() => tone(700, 0.15, 'sine', 900), 100);
  } else if (type === 'exit') {
    tone(400, 0.1, 'sine');
    setTimeout(() => tone(500, 0.1, 'sine'), 100);
    setTimeout(() => tone(700, 0.2, 'sine'), 200);
  }
};
