let _actx = null;
const getCtx = () => {
  if (!_actx) _actx = new AudioContext();
  return _actx;
};

const tone = (freq, endFreq, duration, type = 'square', volume = 0.08) => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq !== null) {
      osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
};

export const playSound = (type) => {
  if (type === 'punch_throw') tone(600, 400, 0.08, 'square');
  if (type === 'kick_throw')  tone(500, 300, 0.10, 'square');
  if (type === 'hit_connect') tone(200, 80,  0.15, 'sawtooth');
  if (type === 'got_hit')     tone(300, 150, 0.15, 'sawtooth');
  if (type === 'stun')        tone(400, 200, 0.20, 'sine');
  if (type === 'enemy_die')   tone(250, 60,  0.30, 'sawtooth');
  if (type === 'clash') {
    tone(800, null, 0.12, 'square', 0.06);
    tone(900, null, 0.12, 'square', 0.06);
  }
  if (type === 'powerup') {
    tone(500, 800, 0.06, 'sine', 0.10);
    tone(800, 1100, 0.12, 'sine', 0.08);
  }
};
