let _actx = null;
const getCtx = () => {
  if (!_actx) _actx = new AudioContext();
  return _actx;
};

const tone = (frequency, duration, type = 'square', endFreq = null, volume = 0.08) => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
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
  if (type === 'shoot') {
    tone(800, 0.08, 'square', 600);
  } else if (type === 'enemy_shoot') {
    tone(350, 0.08, 'square', 250);
  } else if (type === 'explode_small') {
    tone(200, 0.15, 'sawtooth', 80);
  } else if (type === 'explode_boss') {
    tone(180, 0.3, 'sawtooth', 60);
    tone(220, 0.3, 'sawtooth', 80);
  } else if (type === 'explode_player') {
    tone(300, 0.4, 'sawtooth', 60);
    tone(150, 0.4, 'sawtooth', 40);
  } else if (type === 'capture') {
    tone(600, 0.5, 'sine', 200);
  } else if (type === 'dual') {
    tone(400, 0.15, 'sine', 700);
    setTimeout(() => tone(700, 0.15, 'sine', 900), 150);
    setTimeout(() => tone(900, 0.2, 'sine', 1100), 300);
  } else if (type === 'stage_clear') {
    tone(400, 0.1, 'sine');
    setTimeout(() => tone(600, 0.1, 'sine'), 120);
    setTimeout(() => tone(800, 0.2, 'sine'), 240);
  } else if (type === 'tractor_pulse') {
    tone(60, 0.15, 'square', 55, 0.05);
  } else if (type === 'challenge_start') {
    tone(500, 0.1, 'sine');
    setTimeout(() => tone(700, 0.1, 'sine'), 100);
    setTimeout(() => tone(900, 0.2, 'sine'), 200);
  }
};
