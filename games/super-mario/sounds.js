let _actx = null;
let _walkInterval = null;

const getCtx = () => {
  if (!_actx) _actx = new AudioContext();
  return _actx;
};

const tone = (freq, endFreq, duration, type = 'square') => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq !== null) {
      osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
};

export const playSound = (type) => {
  if (type === 'jump')  tone(300, 500, 0.15, 'sine');
  if (type === 'stomp') tone(150, 100, 0.1);
  if (type === 'death') tone(400, 100, 0.4, 'sine');
  if (type === 'coin')  tone(800, 1000, 0.1, 'sine');
};

export const startWalking = () => {
  if (_walkInterval) return;
  const step = () => tone(120, 80, 0.07, 'square');
  step();
  _walkInterval = setInterval(step, 220);
};

export const stopWalking = () => {
  if (_walkInterval) {
    clearInterval(_walkInterval);
    _walkInterval = null;
  }
};
