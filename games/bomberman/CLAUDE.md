# CLAUDE.md — Gamedoh Starter-Kit

This is the skeleton for building gamedoh HTML5 canvas games. Extend it — do not replace or restructure it.

## Running the Game

```bash
npx serve .   # from the repo root
# Then open: http://localhost:3000/games/[game-name]/index.html
```

---

## Engine (`gamedoh-engine.js`)

All framework classes are imported from the CDN and re-exported here. **Never import directly from the CDN URL in game files** — always import from `./gamedoh-engine.js`.

To add local utilities (e.g. `Flash`), define them at the bottom of `gamedoh-engine.js` and export them there — not in separate files.

**Always prefer framework exports over writing your own equivalents.** Before implementing a helper, check the list below — it is likely already provided.

### Available exports and what they do

| Export | What it does |
|---|---|
| `BaseGame` | Base class for `game.js` — manages game loop, state machine, score, lives, buttons |
| `State` | Base class for entity states — extend and implement `enter()`, `getImage()`, `nextFrame()` |
| `Image` | Holds an array of sprite frames; call `.next()` to advance, `.getImage()` to get current frame |
| `Level` | Base class for `level.js` — tracks level index, provides `isLast()` |
| `GameTimer` | Counts down from N seconds, fires a tick callback each second and a completion callback at 0 |
| `Timer` | Simple frame counter — counts up; use for per-entity cooldowns or animation timing |
| `Countdown` | Renders an animated circled number on canvas counting down (3-2-1); returns a Promise |
| `Button` | Text button (green bg, white text) — has `draw(ctx)` and `isClicked(x, y)` |
| `PixelButton` | Pixel-art button rendered from a 2D sprite array — same API as Button |
| `Shake` | Screen-shake effect — call `trigger()` on impact; BaseGame applies it automatically |
| `Flash` | Post-respawn invincibility flicker — call `trigger(frames)`; check `.visible` in draw |
| `drawShape` | Renders a 2D pixel-art array to canvas: `drawShape(ctx, blockSize, sprite, x, y)` |
| `isCollision` | AABB collision check: `isCollision(a, b)` where a/b have `{x, y, width, height}` |
| `getRandomNumber` | `getRandomNumber(range)` → integer in `[0, range)` — use instead of `Math.random()` |
| `shuffle` | `shuffle(array)` → returns a new randomly shuffled copy of the array |
| `delay` | `await delay(ms)` — async pause; use in level transitions or cutscenes |
| `stopAllAudio` | Pauses and resets all `<audio>` elements on the page |
| `GAME_STATE` | Enum: `GAME_STATE.START`, `GAME_STATE.PLAYING`, `GAME_STATE.PAUSED`, `GAME_STATE.OVER` |

---

## Game Class (`game.js`)

Always extends `BaseGame`. Pass all config through `super()`:

```js
class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth, canvasHeight, blockSize, heartbeat,
      lives, initialSpeed, maxSpeed, speedUpEvery,
    });
    this.level = new Level(this);
    // initialise entity arrays here: this.enemies = [], this.pickups = [], etc.
  }

  _update()          { /* update all entities each frame */ }
  _drawWorld()       { /* render background + all entities */ }
  drawStartScreen()  { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay() { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton); }
  drawWinScreen()    { drawWinScreen(this.ctx, this.score, this.restartButton); }
  drawHUD()          { /* lives, score, timer, pause hint */ }

  loseLife() { /* game-specific cleanup, then */ super.loseLife(); }
  win()      { super.win(); }
}
```

Callbacks are wired in `main.js`:
- `game.onRestart` — full reset (new player, new enemies)
- `game.onLevelSetup` — called between levels (reset enemies only)
- `game.onLoseLife` — respawn player, trigger `player.flash.trigger(INVINCIBLE_FRAMES)`

---

## Entity Pattern (OOP, no base class)

Every entity — player, enemy, pickup — follows this structure:

```js
class Enemy {
  constructor(game, startX, startY) {
    this.game = game;
    this.x = startX; this.y = startY;
    this.vx = 0;     this.vy = 0;
    this.width = ENEMY_W; this.height = ENEMY_H;
    this.alive = true;

    // State machine
    this.states = {
      [IDLE]:    new IdleState(this),
      [WALKING]: new WalkingState(this),
    };
    this.currentState = this.states[IDLE];
    this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  update(player) {
    this.currentState.nextFrame();
    // physics, collision, player interaction here
  }

  draw(ctx) {
    drawShape(ctx, BLOCK_SIZE, this.currentState.getImage(), this.x, this.y);
  }
}
```

- **No inheritance between entities** — keep them independent classes
- **`alive` flag**: remove dead entities with `.filter(e => e.alive)` each frame in `_update()`

---

## State Machine (`[entity]/states.js`)

States extend `State` from gamedoh-engine. Every state must implement `enter()`, `getImage()`, `nextFrame()`:

```js
import { State, Image } from '../gamedoh-engine.js';
import { frameA, frameB } from './images.js';

export const IDLE    = 'IDLE';
export const WALKING = 'WALKING';

export class IdleState extends State {
  constructor(entity) {
    super(entity, IDLE);
    this.image = new Image([frameA]);
  }
  enter()      { this.image.index = 0; }
  getImage()   { return this.image.getImage(); }
  nextFrame()  {} // no animation
}

export class WalkingState extends State {
  constructor(entity) {
    super(entity, WALKING);
    this.image = new Image([frameA, frameB]); // 2-frame walk cycle
    this._timer = 0;
  }
  enter()    { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {
    if (++this._timer >= 5) { // toggle frame every 5 ticks
      this._timer = 0;
      this.image.next();
    }
  }
}
```

---

## Sprites / Pixel Art (`[entity]/images.js`)

Sprites are 2D arrays of single-character color codes:

```js
// Color codes: r=red  o=orange  y=yellow  g=green  b=blue  l=lightblue
//              p=purple  e=grey  d=black  w=white  _=transparent
export const mySprite = [
  ['_','r','r','_'],
  ['r','w','w','r'],
  ['r','r','r','r'],
  ['_','r','r','_'],
];
```

Render with:
```js
ctx.save();
drawShape(ctx, BLOCK_SIZE, mySprite, x, y);
ctx.restore();
```

---

## Constants (`constants.js`)

**All configurable values go here — never hardcode numbers in game logic.**

Why: `constants.js` is the single place to tune the entire game. When a value lives here, you change it once and every file that imports it picks up the change instantly — no hunting through game.js, player.js, level.js, and platform.js to find all the `80`s that meant "platform gap". Hardcoded magic numbers scatter that knowledge across files and make balancing or bug-fixing painful.

Rule of thumb: if a number appears in game logic, it belongs in `constants.js` with a descriptive name.

Required base constants (already in starter-kit):
```js
export const BLOCK_SIZE  = 5;
export const CANVAS_WIDTH  = 600;
export const CANVAS_HEIGHT = 400;
export const HEART_BEAT    = 90;    // ms per frame
export const LIVES         = 3;
export const LEVELS        = [30, 30]; // seconds per level
export const INITIAL_SPEED = 1;
export const MAX_SPEED     = 3;
export const SPEED_UP_EVERY = 5;
```

Add game-specific constants below:
```js
// Scoring
export const ENEMY_SCORE   = 10;
export const PICKUP_SCORE  = 20;

// Physics (pixels)
export const GRAVITY    = 0.45;
export const JUMP_VY    = -12;
export const MOVE_SPEED = 3;

// Entity sizes (px)
export const PLAYER_W = 12 * BLOCK_SIZE;
export const PLAYER_H = 14 * BLOCK_SIZE;

// Invincibility
export const INVINCIBLE_FRAMES = 60; // ~2s at 30fps (HEART_BEAT=33ms)
```

---

## `Flash` — Post-Respawn Invincibility

Always apply `Flash` to the player after respawn so they cannot be immediately killed:

```js
// Player constructor:
this.flash = new Flash(); // import Flash from gamedoh-engine.js

// Player update():
this.flash.update();

// Player draw():
if (!this.flash.visible) return; // skip draw during hidden phase — creates flicker

// Enemy collision check:
} else if (!player.flash?.active) {
  player.die(); // only kill if not invincible
}

// main.js — after respawn in game.onLoseLife:
game.player.flash.trigger(INVINCIBLE_FRAMES);
```

`INVINCIBLE_FRAMES` lives in `constants.js`. `framesPerToggle` (default 4) controls blink speed — pass to constructor: `new Flash(6)` for slower blinking.

---

## `Shake` — Screen Shake

```js
// Game constructor:
this.shake = new Shake(); // import Shake from gamedoh-engine.js

// On impact (e.g. player hit):
this.game.shake.trigger();
```

`BaseGame` applies the shake automatically via `_drawWorldShaked()` — just trigger it.

---

## Level System (`level.js`)

```js
import { Level as FrameworkLevel, GameTimer } from './gamedoh-engine.js';
import { LEVELS, HEART_BEAT, LIVES } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
    this._remaining = LEVELS[0];
    this._createTimer();
  }

  get duration() { return LEVELS[this.index]; }

  _createTimer() {
    this._done = false;
    this._timeUp = false;
    this.timer = new GameTimer(
      this.duration, HEART_BEAT,
      (remaining) => { if (!this._done) this._remaining = remaining; },
      () => { if (!this._done) { this._done = true; this._timeUp = true; } }
      // _timeUp is handled in game._update() — never act directly in callback
      // (timer fires independently; _update() only runs during active gameplay)
    );
    this._remaining = this.duration;
  }

  // Call from game._update() when player reaches the goal
  reachEnd() {
    if (this._done) return;
    this._done = true;
    if (this.isLast()) { this.game.win(); } else { this._advance(); }
  }

  async _advance() {
    this.index++;
    // show transition screen, then:
    this.game.lives = LIVES;
    this._createTimer();
    this.timer.start();
    if (this.game.onLevelSetup) this.game.onLevelSetup();
  }

  reset() { this.index = 0; this._createTimer(); }
  draw()  {} // draw HUD in game.drawHUD() instead
}
```

---

## Input Handling (`inputHandler.js`)

**Movement keys must NOT be forwarded to `game.handleKey()`** — doing so causes arrow keys to accidentally restart the game from the game-over screen.

```js
import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  const keys = {};
  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    // Only non-movement keys go to the framework (handles pause/start/restart)
    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    keys[e.key] = true;

    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowLeft')  game.player.move('left');
      if (e.key === 'ArrowRight') game.player.move('right');
      if (e.key === 'ArrowUp' || e.key === ' ') game.player.move('jump');
    }
  });

  document.body.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (game.state === GAME_STATE.PLAYING) {
      if ((e.key === 'ArrowLeft' && !keys['ArrowRight']) ||
          (e.key === 'ArrowRight' && !keys['ArrowLeft'])) {
        game.player.move('stop');
      }
    }
  });
};

export default inputHandler;
```

---

## Audio

### Music / background tracks — `<audio>` tags in `index.html`

Browse available audio files at **https://jskidz.au/audio** and add tags:

```html
<!-- in index.html <body> -->
<audio id="overAudio" src="https://jskidz.au/audio/game-over.wav"></audio>
<audio id="winAudio"  src="https://jskidz.au/audio/winning-chimes.wav"></audio>
<audio id="bgMusic"   src="https://jskidz.au/audio/[chosen-file].wav" loop></audio>
```

Access and control in JS:
```js
const winAudio = document.getElementById('winAudio');
winAudio.currentTime = 0;
winAudio.play().catch(() => {}); // always .catch() to suppress autoplay errors
winAudio.loop = false;
winAudio.pause();
```

### Sound effects — Web Audio API in `sounds.js`

Use synthesised tones for one-shot effects (no audio file needed):

```js
let _actx = null;
const getCtx = () => { if (!_actx) _actx = new AudioContext(); return _actx; };

const tone = (freq, endFreq, duration, type = 'square') => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
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
  if (type === 'jump')  tone(300, 500, 0.15, 'sine');
  if (type === 'stomp') tone(150, 100, 0.1);
  if (type === 'death') tone(400, 100, 0.4, 'sine');
};

// Continuous walking sound:
let _walkInterval = null;
export const startWalking = () => {
  if (_walkInterval) return;
  const step = () => tone(120, 80, 0.07, 'square');
  step();
  _walkInterval = setInterval(step, 220);
};
export const stopWalking = () => {
  clearInterval(_walkInterval);
  _walkInterval = null;
};
```

---

## Canvas State Rules

- Always wrap ctx property changes in `ctx.save()` / `ctx.restore()`
- Never leak `fillStyle`, `font`, `textAlign`, `globalAlpha`, `lineWidth` between draw calls

---

## Respawn Safety

Track the player's last safe ground position to avoid respawning over a pit:

```js
// In player update(), when onGround is true:
if (this.onGround) this._lastGroundX = this.x;

// In game.loseLife() / onLoseLife:
const spawnX = game._lastGroundX ?? PLAYER_START_X;
game.player = new Player(game, spawnX);
game.player.flash.trigger(INVINCIBLE_FRAMES);
```
