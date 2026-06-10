export const drawGrid = (ctx, width, height, blockSize) => {
  ctx.save();
  ctx.strokeStyle = 'lightgrey';
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }
  ctx.restore();
};

const colorMap = {
  r: 'red',
  i: 'pink',
  o: 'orange',
  y: 'yellow',
  b: 'blue',
  l: 'lightblue',
  g: 'green',
  p: 'purple',
  e: 'grey',
  d: 'black',
  w: 'white',
};

export const drawShape = (ctx, blockSize, image, x, y) => {
  ctx.save();
  for (let j = 0; j < image.length; j++) {
    for (let i = 0; i < image[0].length; i++) {
      if (colorMap[image[j][i]]) {
        ctx.fillStyle = colorMap[image[j][i]];
        ctx.fillRect(x + i * blockSize, y + j * blockSize, blockSize, blockSize);
      }
    }
  }
  ctx.restore();
};

export const isCollision = (a, b) => {
  if (a.width && b.width && a.height && b.width) {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }
  return false;
};

export const getRandomNumber = (range) => Math.floor(Math.random() * range);

export const shuffle = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const delay = (timeout) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });

export const stopAllAudio = () =>
  document.querySelectorAll('audio').forEach(a => { a.loop = false; a.pause(); });

export class Shake {
  constructor(frames = 20, intensity = 1.2) {
    this._frames = frames;
    this._intensity = intensity;
    this._remaining = 0;
  }

  trigger() { this._remaining = this._frames; }

  apply(ctx) {
    if (this._remaining <= 0) return;
    const offset = this._remaining * this._intensity;
    ctx.translate((Math.random() - 0.5) * offset, (Math.random() - 0.5) * offset);
    this._remaining--;
  }
}

// Post-respawn invincibility flash — mirrors the Shake utility pattern.
// Usage:
//   this.flash = new Flash()
//   flash.trigger(60)          // start flashing for 60 frames (~2s at 30fps)
//   flash.update()             // call once per update tick
//   if (!flash.visible) return // skip draw during hidden phase
//   if (!entity.flash?.active) { /* can be killed */ }
export class Flash {
  constructor(framesPerToggle = 4) {
    this._framesPerToggle = framesPerToggle;
    this._remaining = 0;
  }

  trigger(frames) { this._remaining = frames; }

  update() { if (this._remaining > 0) this._remaining--; }

  // False during the hidden phase — return early from draw() when this is false
  get visible() {
    if (this._remaining <= 0) return true;
    return Math.floor(this._remaining / this._framesPerToggle) % 2 !== 0;
  }

  // True while invincibility frames are still counting down
  get active() { return this._remaining > 0; }
}
