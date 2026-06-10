# CLAUDE.md — Contra Game Blueprint

This file is a complete self-contained specification for rebuilding this Contra-style game from
scratch in an empty folder. If you are a Claude AI reading this in an empty directory, follow
Section 13 (the step-by-step build prompts) to recreate the exact same game.

---

## 1. Game Concept

A two-level side-scrolling action game inspired by Contra. The player runs, jumps, and shoots
through two stages:
- **Level 1** — horizontal scrolling (left → right), 60 seconds
- **Level 2** — vertical scrolling (bottom → top), 60 seconds

**Enemies:** Soldiers (walk + shoot), Cannons (stationary, rotate direction, shoot).
**Collectibles:** Flags (+10 pts, shoot or walk into).
**Win:** Reach the end of both levels within the time limit.

---

## 2. How to Run

```bash
npx serve .
# Open http://localhost:3000/index.html
```

Requires: modern browser (ES6 modules). No build step, no npm install.

---

## 3. External Dependency: gamedoh-engine.js

The game imports from `./gamedoh-engine.js`, which is a re-export wrapper around a local
framework at `../gamedoh-framework/`. When rebuilding from scratch, **copy
`gamedoh-engine.js` from the source**, or adjust the import paths to point to the framework.

Key exports used by the game:

| Export | Purpose |
|--------|---------|
| `BaseGame` | Main game loop, state machine, lives, score, shake |
| `GAME_STATE` | Enum: `START`, `PLAYING`, `PAUSED`, `GAME_OVER`, `WIN` |
| `isCollision(a, b)` | AABB collision — returns true if two `{x,y,width,height}` overlap |
| `drawShape(ctx, blockSize, array, x, y)` | Renders a 2D char array as pixel art |
| `Flash` | Blink effect — `.trigger(frames)`, `.update()`, `.visible`, `.active` |
| `Shake` | Screen shake — `.trigger()` |
| `GameTimer` | Countdown timer — `new GameTimer(secs, heartbeat, onTick, onDone)` |
| `Level` (as `FrameworkLevel`) | Base level class |
| `State` | Base state machine class |
| `Image` | Animation frame manager — `new Image([frame1, frame2])`, `.next()`, `.getImage()` |
| `Button` | Text button — `.draw(ctx)`, `.isClicked(x, y)` |

---

## 4. File Structure

```
games/contra/
├── index.html
├── gamedoh-engine.js       ← copy from framework (do not rewrite)
├── main.js                 ← entry point, spawning, callbacks
├── game.js                 ← game loop, collision, HUD
├── constants.js            ← all config values
├── inputHandler.js         ← keyboard input
├── level.js                ← level progression + timer
├── terrain.js              ← background, platforms, collision rects
├── screens.js              ← start / pause / gameover / win screens
├── splashImage.js          ← 64×37 pixel art for start screen
├── sounds.js               ← procedural Web Audio sounds
├── bullet.js               ← Bullet class
├── flag.js                 ← Flag collectible class + sprite
├── player/
│   ├── index.js            ← Player class (physics, states, shooting)
│   ├── states.js           ← 6 player states
│   └── images.js           ← 4 player sprite arrays (29×29)
├── soldier/
│   ├── index.js            ← Soldier AI class
│   ├── states.js           ← 3 soldier states
│   └── images.js           ← 2 soldier sprite arrays (29×29)
└── cannon/
    ├── index.js            ← Cannon turret class
    └── images.js           ← 4 direction sprites (20×20) via matrix rotation
```

---

## 5. constants.js — All Values

```js
export const BLOCK_SIZE    = 2;       // px per sprite cell
export const CANVAS_WIDTH  = 640;
export const CANVAS_HEIGHT = 320;
export const HEART_BEAT    = 33;      // ms per frame (~30 fps)
export const LIVES         = 7;
export const LEVELS        = [60, 60]; // seconds per level
export const INITIAL_SPEED = 1;
export const MAX_SPEED     = 3;
export const SPEED_UP_EVERY = 5;

export const GRAVITY             = 0.5;   // px/frame²
export const JUMP_VY             = -12;   // px/frame upward
export const MOVE_SPEED          = 3;     // px/frame horizontal
export const BULLET_SPEED        = 8;     // px/frame
export const SOLDIER_SPEED       = 1;
export const SHOOT_COOLDOWN      = 15;    // frames between player shots
export const ENEMY_SHOOT_INTERVAL = 90;
export const ENEMY_SHOOT_RANGE   = 300;  // px

export const PLAYER_W  = 58;   // 29 cells × BLOCK_SIZE
export const PLAYER_H  = 58;
export const SOLDIER_W = 58;
export const SOLDIER_H = 58;

export const GROUND_Y    = 260;
export const WORLD_WIDTH = 2560;
export const WORLD_HEIGHT = 1600;
export const PLAT_H      = 20;
export const INVINCIBLE_FRAMES = 60;
export const KILL_SCORE  = 100;

export const LEVELS_DATA = [
  {
    type: 'horizontal',
    endX: 1300,
    platforms: [
      { x: 280, y: GROUND_Y - 80,  w: 160 },
      { x: 550, y: GROUND_Y - 140, w: 130 },
      { x: 850, y: GROUND_Y - 80,  w: 180 },
    ],
    soldiers: [450, 750, 1050],
  },
  {
    type: 'vertical',
    endY: 380,
    platforms: [
      { x: 100, y: 1480, w: 220 },
      { x: 280, y: 1380, w: 220 },
      { x: 100, y: 1280, w: 220 },
      { x: 280, y: 1180, w: 220 },
      { x: 100, y: 1080, w: 220 },
      { x: 280, y:  980, w: 220 },
      { x: 100, y:  880, w: 220 },
      { x: 280, y:  780, w: 220 },
      { x: 100, y:  680, w: 220 },
      { x: 280, y:  580, w: 220 },
      { x: 160, y:  480, w: 220 },
    ],
    soldiers: [
      { x: 140, y: 1480 }, { x: 360, y: 1380 },
      { x: 140, y: 1280 }, { x: 360, y: 1180 },
      { x: 140, y: 1080 }, { x: 360, y:  980 },
      { x: 140, y:  880 },
    ],
  },
];
```

**Platform reachability math:** max jump height = JUMP_VY² / (2 × GRAVITY) = 144 px.
Level 2 platforms are 100 px apart vertically ✓. Level 2 platforms are 220 px wide, alternating
between x=100 and x=280, giving a 40 px overlap zone (280–320) so players can jump straight up.

---

## 6. index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Contra</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    #loading { color: #aaa; font-family: monospace; font-size: 16px; }
    canvas { display: none; image-rendering: pixelated; }
  </style>
</head>
<body>
  <div id="loading">Loading…</div>
  <canvas id="gameCanvas"></canvas>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

---

## 7. Game Mechanics

### Physics (every frame)
```
vy += GRAVITY           // 0.5 px/frame²
x  += vx
y  += vy
```

**Landing detection** (in `_resolveTerrain`):
```js
const prevBottom = this.y + this.height - this.vy;
if (x+w > rect.x && x < rect.x+rect.w && y+h > rect.y && prevBottom <= rect.y) {
  this.y = rect.y - this.height;
  this.vy = 0;
  this.onGround = true;
}
```

**Fall death:** `if (y > game.worldBottom) player.die()`

### Camera
```js
// Horizontal level
cameraX = Math.max(0, Math.min(player.x - CANVAS_WIDTH / 3, WORLD_WIDTH - CANVAS_WIDTH));
cameraY = 0;

// Vertical level
cameraX = 0;
cameraY = Math.max(0, Math.min(player.y - CANVAS_HEIGHT * 2/3, WORLD_HEIGHT - CANVAS_HEIGHT));
```

All entities render at `(x - cameraX, y - cameraY)`.

### Scoring
| Action | Points |
|--------|--------|
| Shoot soldier | +100 |
| Shoot or walk into flag | +10 |
| Shoot cannon | +5 |

### Lives & Respawn
- 7 lives per level, refreshed on level transition
- Each frame when `!player._dead`, save `game._lastAliveX = player.x`, `game._lastAliveY = player.y`
- On death (if lives > 0): respawn at `_lastAliveX / _lastAliveY`, trigger 60-frame invincibility flash
- Time up: instant loseLife(), auto game over if no lives remain

### Level Transition
- Horizontal: player reaches `x + width >= levelData.endX` → `level.reachEnd()`
- Vertical: player reaches `y <= levelData.endY` → `level.reachEnd()`
- `reachEnd()` sets `game._levelBanner = 90` (3-second 3-2-1 countdown banner) then loads next level
- After the last level: `game.win()`

### HUD (top bar, 30 px tall, rgba(0,0,0,0.45))
- **Left:** Red (♥) hearts, font `bold 14px monospace`, color `#e53935`, 16 px apart, one per life
- **Center:** `LVL N   TIME: Xs` — white `#fff` normally, `#ff5252` when ≤ 5 s
- **Right:** `SCORE: N` in `#ffeb3b`

---

## 8. bullet.js

```js
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants.js';

class Bullet {
  constructor(x, y, vx, vy, owner) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.owner = owner;   // 'player' or 'enemy'
    this.width = 6; this.height = 4; this.alive = true;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > WORLD_WIDTH || this.y < 0 || this.y > WORLD_HEIGHT)
      this.alive = false;
  }
  draw(ctx, cameraX, cameraY = 0) {
    if (!this.alive) return;
    ctx.save();
    ctx.fillStyle = this.owner === 'player' ? '#ffeb3b' : '#ff6d00';
    ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
    ctx.restore();
  }
}
export default Bullet;
```

---

## 9. sounds.js

```js
let _actx = null;
const getCtx = () => { if (!_actx) _actx = new AudioContext(); return _actx; };

const tone = (freq, endFreq, duration, type = 'square') => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
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
  if (type === 'shoot') tone(800, 400, 0.08);
  if (type === 'jump')  tone(300, 500, 0.15, 'sine');
  if (type === 'hit')   tone(200, 100, 0.15);
  if (type === 'death') tone(400, 80,  0.4,  'sine');
};
```

---

## 10. terrain.js

```js
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT, PLAT_H } from './constants.js';

export const drawBackground = (ctx, cameraX, cameraY, isVertical) => {
  ctx.save();
  if (isVertical) {
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const offset = Math.floor(cameraY * 0.4) % 60;
    ctx.fillStyle = '#1a1a2e';
    for (let ty = -offset; ty < CANVAS_HEIGHT + 60; ty += 60)
      ctx.fillRect(0, ty, CANVAS_WIDTH, 10);
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(0, 0, 8, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 8, 0, 8, CANVAS_HEIGHT);
  } else {
    ctx.fillStyle = '#0d1b0d';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const offset = Math.floor(cameraX * 0.4) % 80;
    for (let tx = -offset; tx < CANVAS_WIDTH + 80; tx += 80) {
      ctx.fillStyle = '#3e2a10';
      ctx.fillRect(tx, 0, 14, CANVAS_HEIGHT);
      ctx.fillStyle = '#1b3a1b';
      ctx.fillRect(tx - 10, 0, 34, 50);
    }
  }
  ctx.restore();
};

export const drawTerrain = (ctx, levelData, cameraX, cameraY) => {
  ctx.save();
  const drawPlatform = (px, py, pw) => {
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(px, py, pw, PLAT_H);
    ctx.fillStyle = '#c8962e';
    for (let bx = px; bx < px + pw; bx += 30) ctx.fillRect(bx, py + 4, 18, 8);
    ctx.fillStyle = '#2e7d32'; ctx.fillRect(px, py, pw, 6);
    ctx.fillStyle = '#4caf50'; ctx.fillRect(px, py, pw, 3);
  };

  if (levelData.type === 'vertical') {
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(0, WORLD_HEIGHT - cameraY, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, WORLD_HEIGHT - cameraY, CANVAS_WIDTH, 4);
    ctx.fillStyle = '#4a3010';
    ctx.fillRect(0, 0, 8, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 8, 0, 8, CANVAS_HEIGHT);
    for (const p of levelData.platforms)
      drawPlatform(p.x, p.y - cameraY, p.w);
    // End flag at top
    const flagX = CANVAS_WIDTH / 2 - 15;
    const flagY = levelData.endY - cameraY;
    ctx.fillStyle = '#ffeb3b'; ctx.fillRect(flagX, flagY, 5, 80);
    ctx.fillStyle = '#ff6f00'; ctx.fillRect(flagX + 5, flagY, 24, 16);
  } else {
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(-cameraX, GROUND_Y, WORLD_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = '#c8962e';
    for (let bx = 0; bx < WORLD_WIDTH; bx += 40) ctx.fillRect(bx - cameraX, GROUND_Y + 8, 28, 14);
    ctx.fillStyle = '#2e7d32'; ctx.fillRect(-cameraX, GROUND_Y, WORLD_WIDTH, 7);
    ctx.fillStyle = '#4caf50'; ctx.fillRect(-cameraX, GROUND_Y, WORLD_WIDTH, 3);
    for (const p of levelData.platforms)
      drawPlatform(p.x - cameraX, p.y, p.w);
    // End flag
    ctx.fillStyle = '#ffeb3b'; ctx.fillRect(levelData.endX - cameraX, GROUND_Y - 90, 5, 90);
    ctx.fillStyle = '#ff6f00'; ctx.fillRect(levelData.endX - cameraX + 5, GROUND_Y - 90, 24, 16);
  }
  ctx.restore();
};

export const getTerrain = (levelData) => {
  if (levelData.type === 'vertical') {
    const rects = [
      { x: 0, y: WORLD_HEIGHT, w: CANVAS_WIDTH, h: 40 },
      { x: -40, y: 0, w: 40, h: WORLD_HEIGHT + 40 },
      { x: CANVAS_WIDTH, y: 0, w: 40, h: WORLD_HEIGHT + 40 },
    ];
    for (const p of levelData.platforms)
      rects.push({ x: p.x, y: p.y, w: p.w, h: PLAT_H });
    return rects;
  }
  const rects = [{ x: 0, y: GROUND_Y, w: WORLD_WIDTH, h: CANVAS_HEIGHT - GROUND_Y }];
  for (const p of levelData.platforms)
    rects.push({ x: p.x, y: p.y, w: p.w, h: PLAT_H });
  return rects;
};
```

---

## 11. Sprite Color Palette

All sprites are 2D char arrays rendered by `drawShape(ctx, BLOCK_SIZE, array, x, y)`.

```
_ = transparent (skip pixel)
r = #f44336   red
o = #ff9800   orange / skin
y = #ffeb3b   yellow
g = #4caf50   green
b = #1565c0   blue
p = #f4c2a1   peach / light skin
d = #212121   dark / near-black
w = #ffffff   white
k = #111111   near-black
s = #aaaaaa   gray
u = #c8a06e   tan / wood
l = #c8a06e   light interior (same hex as u)
e = #eeeeee   edge / light gray
```

---

## 12. Sprite Data

### flag.js — 20×20 sprite

```js
import { drawShape } from './gamedoh-engine.js';
import { BLOCK_SIZE } from './constants.js';

export const FLAG_W = 20 * BLOCK_SIZE;   // 40 px
export const FLAG_H = 20 * BLOCK_SIZE;   // 40 px
export const FLAG_SCORE = 10;

const IMAGE = [
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e'],
  ['e','d','l','d','d','d','d','d','d','d','d','d','d','d','d','d','d','l','d','e'],
  ['e','d','l','d','r','r','r','l','l','l','l','l','l','r','r','r','d','l','d','e'],
  ['e','d','l','d','r','r','l','l','d','d','d','l','l','l','r','r','d','l','d','e'],
  ['e','d','l','d','r','l','l','d','r','r','r','d','l','l','l','r','d','l','d','e'],
  ['e','d','l','d','l','l','d','r','r','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','l','l','l','l','d','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','d','r','r','r','r','r','r','r','r','r','r','d','d','l','d','e'],
  ['e','d','l','d','l','d','d','r','r','r','r','r','r','d','d','l','d','l','d','e'],
  ['e','d','l','d','l','l','l','l','d','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','l','l','l','l','d','r','r','d','l','l','l','l','d','l','d','e'],
  ['e','d','l','d','r','l','l','d','r','r','r','r','d','l','l','r','d','l','d','e'],
  ['e','d','l','d','r','r','l','d','d','d','d','d','d','l','r','r','d','l','d','e'],
  ['e','d','l','d','r','r','r','l','l','l','l','l','l','r','r','r','d','l','d','e'],
  ['e','d','l','d','d','d','d','d','d','d','d','d','d','d','d','d','d','l','d','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e'],
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
];

class Flag {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.width = FLAG_W; this.height = FLAG_H; this.alive = true;
  }
  draw(ctx, cameraX, cameraY = 0) {
    if (!this.alive) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, IMAGE, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}
export default Flag;
```

### cannon/images.js — 20×20 base + 3 rotations

```js
const CANNON_RIGHT = [
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','d','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','d','d','d','d','d','d','d','l','d','l','d','e','e'],
  ['e','d','l','d','d','d','l','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','d','d','l','l','l','l','l','d','d','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','d','l','d','r','l','l','l','l','l','l','d','d','d','d','d','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','r','r','r','l','l','l','r','l','l','d','d'],
  ['e','d','l','d','l','d','r','l','l','l','l','l','l','d','d','d','d','d','d','d'],
  ['e','d','l','l','l','d','d','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','d','d','l','l','l','l','l','d','d','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','d','d','d','l','l','l','l','l','l','l','d','l','l','l','d','e','e'],
  ['e','d','l','l','l','d','d','d','d','d','d','d','d','d','l','d','l','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','d','l','l','d','e','e'],
  ['e','d','l','l','l','l','l','l','l','l','l','l','l','l','l','l','l','d','e','e'],
  ['e','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','d','e','e'],
  ['e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e','e'],
];

const _T  = g => g[0].map((_, j) => g.map(row => row[j]));  // transpose
const _RR = g => g.map(row => [...row].reverse());            // reverse each row
const _RC = g => [...g].reverse();                            // reverse row order

export const CANNON_UP    = _RC(_T(CANNON_RIGHT));   // 90° CCW
export const CANNON_LEFT  = _RC(_RR(CANNON_RIGHT));  // 180°
export const CANNON_DOWN  = _RR(_T(CANNON_RIGHT));   // 90° CW
export { CANNON_RIGHT };
```

### player/images.js — 4 sprites, each 29×29

Paste the exact arrays from the source. Summary of what each sprite shows:

| Export | Description |
|--------|-------------|
| `PLAYER_MAIN` | Standing pose, red hair, skin face, blue pants, gun arm extended right |
| `PLAYER_WALK` | Walking stride — same upper body, slightly different legs |
| `PLAYER_SHOOT_UP` | Arms raised, gun pointing up; legs split wide |
| `PLAYER_SQUAT` | Top 8 rows blank (body compressed down), same torso/arms as MAIN |

Color codes: `r`=red hair/clothing, `o`=skin, `d`=dark outline, `b`=blue pants, `_`=transparent.

**PLAYER_MAIN (29 rows × 29 cols):**
```js
export const PLAYER_MAIN = [
  ['_','_','_','_','_','_','_','_','_','d','d','d','d','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','r','r','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','d','d','d','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','o','o','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','o','o','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','d','r','o','r','d','o','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','d','o','o','o','r','o','o','r','o','o','d','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','o','o','o','o','o','r','o','o','r','o','o','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','o','o','o','o','o','r','o','o','o','r','o','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','o','o','o','o','r','o','o','o','r','r','o','o','o','_','_','_','_','_','_','_','d','d','_','_'],
  ['_','_','_','_','d','o','o','r','r','r','r','r','r','r','r','d','d','d','d','d','d','d','d','d','d','d','d','d','_'],
  ['_','_','_','_','_','d','o','o','o','o','d','d','d','d','d','o','o','o','d','d','o','o','d','o','o','o','d','d','d'],
  ['_','_','_','_','_','_','d','o','o','o','o','o','o','r','d','d','d','d','d','d','d','d','d','d','d','d','d','d','_'],
  ['_','_','_','_','_','_','_','d','d','o','o','o','o','r','d','d','r','r','d','d','o','d','r','r','r','d','d','_','_'],
  ['_','_','_','_','_','_','_','_','d','d','d','o','o','o','d','d','d','d','o','o','o','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','b','b','b','b','b','d','_','_','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','d','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','d','b','b','b','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','b','d','b','b','b','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','b','d','b','b','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','d','d','b','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','b','d','b','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','b','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','d','b','b','b','d','d','d','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_'],
];
```

**PLAYER_SHOOT_UP (29×29):**
```js
export const PLAYER_SHOOT_UP = [
  ['_','_','_','_','_','_','_','_','_','d','d','d','d','d','_','_','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','r','r','d','_','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','d','d','d','d','d','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','o','o','d','d','d','o','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','o','o','d','_','d','o','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','o','r','d','o','d','_','d','o','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','o','r','o','o','o','o','_','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','o','o','o','r','o','o','r','d','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','o','o','o','o','o','r','o','o','r','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','o','o','o','o','o','r','o','r','r','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','o','o','o','o','o','o','r','r','r','d','d','d','o','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','o','o','o','o','r','r','d','d','o','o','o','o','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','o','o','o','o','o','o','r','r','o','d','d','o','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','d','o','o','o','o','o','o','o','r','r','o','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','d','d','d','o','o','r','d','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','b','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','d','d','d','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','d','_','d','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','d','b','b','b','d','_','_','d','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','b','b','b','d','d','_','_','_','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','b','b','d','_','_','_','_','_','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','d','b','b','d','_','_','_','_','_','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','b','b','b','d','_','_','_','_','_','d','b','b','b','d','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','b','b','b','d','d','_','_','_','_','_','d','b','b','d','d','d','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','b','b','b','b','d','_','_','_','_','_','d','b','b','b','b','d','_','_','_','_','_','_','_','_'],
];
```

**PLAYER_SQUAT (29×29):** Same as PLAYER_MAIN but rows 0–8 are all `_` (body shifted down).
```js
export const PLAYER_SQUAT = [
  // rows 0-8: all '_' (29 underscores each)
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  // rows 9-28: same as PLAYER_MAIN rows 0-19
  ['_','_','_','_','_','_','_','_','_','d','d','d','d','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','r','r','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','d','d','d','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','o','o','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','d','r','o','o','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','d','r','o','r','d','o','d','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','d','o','o','o','r','o','o','r','o','o','d','d','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','o','o','o','o','o','r','o','o','r','o','o','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','o','o','o','o','o','r','o','o','o','r','o','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','d','o','o','o','o','r','o','o','o','r','r','o','o','o','_','_','_','_','_','_','_','d','d','_','_'],
  ['_','_','_','_','d','o','o','r','r','r','r','r','r','r','r','d','d','d','d','d','d','d','d','d','d','d','d','d','_'],
  ['_','_','_','_','_','d','o','o','o','o','d','d','d','d','d','o','o','o','d','d','o','o','d','o','o','o','d','d','d'],
  ['_','_','_','_','_','_','d','o','o','o','o','o','o','r','d','d','d','d','d','d','d','d','d','d','d','d','d','d','_'],
  ['_','_','_','_','_','_','_','d','d','o','o','o','o','r','d','d','r','r','d','d','o','d','r','r','r','d','d','_','_'],
  ['_','_','_','_','_','_','_','_','d','d','d','d','d','d','d','d','d','_','o','o','o','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','d','b','b','b','b','b','b','b','d','d','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','b','b','b','b','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','b','b','b','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','b','d','d','b','b','b','b','b','b','b','d','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','b','b','b','b','b','d','d','d','b','b','b','b','b','d','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','d','d','b','b','b','b','b','d','d','d','b','b','b','d','d','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','d','d','d','d','d','d','d','_','_','d','d','d','d','_','_','_','_','_','_','_','_','_'],
];
```

**PLAYER_WALK (29×29):** Same as PLAYER_MAIN but row 14 has slightly different legs.
(Copy exact array from `player/images.js` — it is identical to PLAYER_MAIN except row 14.)

### soldier/images.js — 2 sprites, each 29×29

**SOLDIER_WALK (29×29):** Red-uniformed enemy, helmet, gun arm.
**SOLDIER_STAND (29×29):** Same but legs in different position.

(Copy exact arrays from `soldier/images.js`.)

### splashImage.js — 64×37 pixel art

The SPLASH array is 37 rows × 64 columns. It depicts two game characters side-by-side
with yellow hair. Rendered at blockSize=3 → 192×111 px on the start screen.

(Copy exact array from `splashImage.js` — it is too large to inline here but is required for
the start screen splash image.)

---

## 13. inputHandler.js

```js
import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  const keys = {};
  const movementKeys = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','z','Z']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (!movementKeys.has(e.key)) game.handleKey(e.key);
    keys[e.key] = true;
    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowLeft')          game.player.move('left');
      if (e.key === 'ArrowRight')         game.player.move('right');
      if (e.key === 'ArrowUp')            game.player.move('aimUp');
      if (e.key === ' ')                  game.player.move('jump');
      if (e.key === 'ArrowDown')          game.player.move('squat');
      if (e.key === 'z' || e.key === 'Z') {
        if (game.player.currentState.state === 'SHOOT_UP') game.player.shootUp(game.bullets);
        else                                                game.player.shoot(game.bullets);
      }
    }
  });

  document.body.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (game.state === GAME_STATE.PLAYING) {
      if ((e.key === 'ArrowLeft'  && !keys['ArrowRight']) ||
          (e.key === 'ArrowRight' && !keys['ArrowLeft']))
        game.player.move('stop');
      if (e.key === 'ArrowUp')   game.player.move('stopAimUp');
      if (e.key === 'ArrowDown') game.player.move('unsquat');
    }
  });
};

export default inputHandler;
```

---

## 14. level.js

```js
import { Level as FrameworkLevel, GameTimer } from './gamedoh-engine.js';
import { LEVELS, HEART_BEAT } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
    this._createTimer();
  }
  get duration() { return LEVELS[this.index]; }

  _createTimer() {
    this._done = false; this._timeUp = false; this._remaining = this.duration;
    this.timer = new GameTimer(
      this.duration, HEART_BEAT,
      (remaining) => { if (!this._done) this._remaining = remaining; },
      ()          => { if (!this._done) this._timeUp = true; },
    );
  }

  reachEnd() {
    if (this._done) return;
    this._done = true; this._timeUp = false;
    if (this.index >= LEVELS.length - 1) {
      this.game.win();
    } else {
      this.index++;
      this.game._levelBanner = 90; // 3-second countdown banner
    }
  }

  startTimer() { this.timer.start(); }
  reset() { this.index = 0; this._createTimer(); }
  draw() {}
}
export default Level;
```

---

## 15. Player Implementation

### player/states.js

```js
import { State, Image } from '../gamedoh-engine.js';
import { PLAYER_MAIN, PLAYER_WALK, PLAYER_SHOOT_UP, PLAYER_SQUAT } from './images.js';

export const IDLE = 'IDLE', RUNNING = 'RUNNING', JUMPING = 'JUMPING';
export const SQUAT = 'SQUAT', SHOOT_UP = 'SHOOT_UP', DEAD = 'DEAD';

export class IdleState extends State {
  constructor(e) { super(e, IDLE); this.image = new Image([PLAYER_MAIN]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
export class RunningState extends State {
  constructor(e) { super(e, RUNNING); this.image = new Image([PLAYER_MAIN, PLAYER_WALK]); this._timer = 0; }
  enter() { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() { if (++this._timer >= 8) { this._timer = 0; this.image.next(); } }
}
export class JumpingState extends State {
  constructor(e) { super(e, JUMPING); this.image = new Image([PLAYER_MAIN]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
export class ShootUpState extends State {
  constructor(e) { super(e, SHOOT_UP); this.image = new Image([PLAYER_SHOOT_UP]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
export class SquatState extends State {
  constructor(e) { super(e, SQUAT); this.image = new Image([PLAYER_SQUAT]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
export class DeadState extends State {
  constructor(e) { super(e, DEAD); this.image = new Image([PLAYER_MAIN]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
```

### player/index.js

```js
import { drawShape, Flash } from '../gamedoh-engine.js';
import { BLOCK_SIZE, PLAYER_W, PLAYER_H, GRAVITY, JUMP_VY, MOVE_SPEED, SHOOT_COOLDOWN, BULLET_SPEED } from '../constants.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';
import { IdleState, RunningState, JumpingState, ShootUpState, SquatState, DeadState,
         IDLE, RUNNING, JUMPING, SHOOT_UP, SQUAT, DEAD } from './states.js';

class Player {
  constructor(game, x, y) {
    this.game = game; this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.width = PLAYER_W; this.height = PLAYER_H;
    this.alive = true; this.facingRight = true; this.onGround = false;
    this._shootCooldown = 0; this._dead = false; this._deadTimer = 0;
    this.flash = new Flash();
    this.states = {
      [IDLE]: new IdleState(this), [RUNNING]: new RunningState(this),
      [JUMPING]: new JumpingState(this), [SHOOT_UP]: new ShootUpState(this),
      [SQUAT]: new SquatState(this), [DEAD]: new DeadState(this),
    };
    this.currentState = this.states[IDLE];
    this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name]; this.currentState.enter();
  }

  move(dir) {
    if (this._dead) return;
    if (dir === 'left')       { this.vx = -MOVE_SPEED; this.facingRight = false; if (this.onGround) this.enterState(RUNNING); }
    else if (dir === 'right') { this.vx = MOVE_SPEED;  this.facingRight = true;  if (this.onGround) this.enterState(RUNNING); }
    else if (dir === 'jump')  { if (this.onGround) { this.vy = JUMP_VY; this.onGround = false; this.enterState(JUMPING); playSound('jump'); } }
    else if (dir === 'aimUp')      { if (this.onGround) this.enterState(SHOOT_UP); }
    else if (dir === 'stopAimUp')  { if (this.currentState.state === SHOOT_UP) this.enterState(IDLE); }
    else if (dir === 'squat')      { if (this.onGround) this.enterState(SQUAT); }
    else if (dir === 'unsquat')    { if (this.currentState.state === SQUAT) this.enterState(IDLE); }
    else if (dir === 'stop')  { this.vx = 0; if (this.onGround && this.currentState.state !== SQUAT && this.currentState.state !== SHOOT_UP) this.enterState(IDLE); }
  }

  shoot(bullets) {
    if (this._dead || this._shootCooldown > 0) return;
    this._shootCooldown = SHOOT_COOLDOWN;
    const vx = this.facingRight ? BULLET_SPEED : -BULLET_SPEED;
    const bx = this.facingRight ? this.x + this.width : this.x;
    const by = this.currentState.state === SQUAT
      ? this.y + Math.floor(this.height * 0.65)
      : this.y + Math.floor(this.height * 0.35);
    bullets.push(new Bullet(bx, by, vx, 0, 'player'));
    playSound('shoot');
  }

  shootUp(bullets) {
    if (this._dead || this._shootCooldown > 0) return;
    this._shootCooldown = SHOOT_COOLDOWN;
    this.enterState(SHOOT_UP);
    bullets.push(new Bullet(this.x + Math.floor(this.width * 0.5), this.y, 0, -BULLET_SPEED, 'player'));
    playSound('shoot');
  }

  die() {
    if (this._dead) return;
    this._dead = true; this.vx = 0; this.vy = -8;
    this.enterState(DEAD); playSound('death');
  }

  update(terrain) {
    this.flash.update();
    if (this._shootCooldown > 0) this._shootCooldown--;
    if (this._dead) {
      this.vy += GRAVITY; this.y += this.vy; this._deadTimer++;
      if (this._deadTimer > 80) this.game.loseLife();
      return;
    }
    this.vy += GRAVITY; this.x += this.vx; this.y += this.vy;
    if (this.x < 0) this.x = 0;
    this.onGround = false;
    this._resolveTerrain(terrain);
    this.currentState.nextFrame();
    if (this.game._isVertical && this.x + this.width > this.game.canvasWidth)
      this.x = this.game.canvasWidth - this.width;
    if (!this._dead && this.y > this.game.worldBottom) this.die();
  }

  _resolveTerrain(terrain) {
    for (const rect of terrain) {
      const prevBottom = this.y + this.height - this.vy;
      if (this.x + this.width > rect.x && this.x < rect.x + rect.w &&
          this.y + this.height > rect.y && prevBottom <= rect.y) {
        this.y = rect.y - this.height; this.vy = 0; this.onGround = true;
        if (this.currentState.state === JUMPING)
          this.enterState(this.vx !== 0 ? RUNNING : IDLE);
        break;
      }
    }
  }

  draw(ctx, cameraX, cameraY = 0) {
    if (!this.flash.visible) return;
    const sprite = this.currentState.getImage();
    const drawn = this.facingRight ? sprite : sprite.map(row => [...row].reverse());
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, drawn, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}
export default Player;
```

---

## 16. Soldier Implementation

### soldier/states.js

```js
import { State, Image } from '../gamedoh-engine.js';
import { SOLDIER_WALK, SOLDIER_STAND } from './images.js';

export const WALKING = 'WALKING', STANDING = 'STANDING', DEAD = 'DEAD';

export class WalkingState extends State {
  constructor(e) { super(e, WALKING); this.image = new Image([SOLDIER_WALK, SOLDIER_STAND]); this._timer = 0; }
  enter() { this.image.index = 0; this._timer = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() { if (++this._timer >= 8) { this._timer = 0; this.image.next(); } }
}
export class StandingState extends State {
  constructor(e) { super(e, STANDING); this.image = new Image([SOLDIER_STAND]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
export class DeadState extends State {
  constructor(e) { super(e, DEAD); this.image = new Image([SOLDIER_STAND]); }
  enter() { this.image.index = 0; }
  getImage() { return this.image.getImage(); }
  nextFrame() {}
}
```

### soldier/index.js

```js
import { drawShape } from '../gamedoh-engine.js';
import { BLOCK_SIZE, SOLDIER_W, SOLDIER_H, GRAVITY, SOLDIER_SPEED,
         ENEMY_SHOOT_INTERVAL, ENEMY_SHOOT_RANGE, KILL_SCORE } from '../constants.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';
import { WalkingState, StandingState, DeadState, WALKING, STANDING, DEAD } from './states.js';

class Soldier {
  constructor(game, x, y) {
    this.game = game; this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.width = SOLDIER_W; this.height = SOLDIER_H;
    this.alive = true; this.onGround = false;
    this._shootTimer = 0; this._deadTimer = 0; this._dead = false;
    this.states = { [WALKING]: new WalkingState(this), [STANDING]: new StandingState(this), [DEAD]: new DeadState(this) };
    this.currentState = this.states[WALKING]; this.currentState.enter();
  }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name]; this.currentState.enter();
  }

  hit() {
    if (this._dead) return;
    this._dead = true; this.vy = -5; this.vx = 2;
    this.enterState(DEAD); this.game.addScore(KILL_SCORE); playSound('hit');
  }

  update(player, bullets, terrain) {
    this.currentState.nextFrame();
    if (this._dead) {
      this.vy += GRAVITY; this.x += this.vx; this.y += this.vy; this._deadTimer++;
      if (this._deadTimer > 50) this.alive = false;
      return;
    }
    const dx = Math.abs(this.x - player.x);
    if (dx < ENEMY_SHOOT_RANGE) { this.enterState(WALKING); this.x -= SOLDIER_SPEED; }
    else                         { this.enterState(STANDING); }
    this.vy += GRAVITY; this.y += this.vy;
    if (this.x + this.width < -64) { this.alive = false; return; }
    this.onGround = false;
    this._resolveTerrain(terrain);
    this._shootTimer++;
    if (this._shootTimer >= ENEMY_SHOOT_INTERVAL && dx < ENEMY_SHOOT_RANGE) {
      this._shootTimer = 0;
      const dir = player.x < this.x ? -1 : 1;
      const bx = dir > 0 ? this.x + this.width : this.x;
      bullets.push(new Bullet(bx, this.y + Math.floor(this.height * 0.35), dir * 5, 0, 'enemy'));
    }
  }

  _resolveTerrain(terrain) {
    for (const rect of terrain) {
      const prevBottom = this.y + this.height - this.vy;
      if (this.x + this.width > rect.x && this.x < rect.x + rect.w &&
          this.y + this.height > rect.y && prevBottom <= rect.y) {
        this.y = rect.y - this.height; this.vy = 0; this.onGround = true; break;
      }
    }
  }

  draw(ctx, cameraX, cameraY = 0) {
    const sprite = this.currentState.getImage();
    ctx.save();
    if (this._dead) ctx.globalAlpha = 0.6;
    drawShape(ctx, BLOCK_SIZE, sprite, this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}
export default Soldier;
```

---

## 17. Cannon Implementation

### cannon/index.js

```js
import { drawShape } from '../gamedoh-engine.js';
import { BLOCK_SIZE, BULLET_SPEED } from '../constants.js';
import Bullet from '../bullet.js';
import { playSound } from '../sounds.js';
import { CANNON_RIGHT, CANNON_UP, CANNON_LEFT, CANNON_DOWN } from './images.js';

export const CANNON_W = 20 * BLOCK_SIZE;  // 40 px
export const CANNON_H = 20 * BLOCK_SIZE;  // 40 px
export const CANNON_SCORE = 5;

const DIRS = ['right', 'left', 'up', 'down'];
const IMAGES = { right: CANNON_RIGHT, up: CANNON_UP, left: CANNON_LEFT, down: CANNON_DOWN };

class Cannon {
  constructor(game, x, y) {
    this.game = game; this.x = x; this.y = y;
    this.width = CANNON_W; this.height = CANNON_H;
    this.direction = DIRS[Math.floor(Math.random() * 4)];
    this.alive = true;
    this._shootTimer    = Math.floor(Math.random() * 90);
    this._shootInterval = 90 + Math.floor(Math.random() * 60);
    this._rotateTimer    = Math.floor(Math.random() * 60);
    this._rotateInterval = 60 + Math.floor(Math.random() * 60);
  }

  update(bullets) {
    if (!this.alive) return;
    if (++this._rotateTimer >= this._rotateInterval) {
      this._rotateTimer = 0; this._rotateInterval = 60 + Math.floor(Math.random() * 60);
      this.direction = DIRS[Math.floor(Math.random() * 4)];
    }
    if (++this._shootTimer >= this._shootInterval) {
      this._shootTimer = 0; this._shootInterval = 90 + Math.floor(Math.random() * 60);
      this._shoot(bullets);
    }
  }

  _shoot(bullets) {
    const cx = this.x + this.width / 2, cy = this.y + this.height / 2;
    let vx = 0, vy = 0, bx = cx, by = cy;
    switch (this.direction) {
      case 'right': vx =  BULLET_SPEED; bx = this.x + this.width; by = cy; break;
      case 'left':  vx = -BULLET_SPEED; bx = this.x;              by = cy; break;
      case 'up':    vy = -BULLET_SPEED; bx = cx; by = this.y;              break;
      case 'down':  vy =  BULLET_SPEED; bx = cx; by = this.y + this.height; break;
    }
    bullets.push(new Bullet(bx, by, vx, vy, 'enemy'));
    playSound('shoot');
  }

  draw(ctx, cameraX, cameraY = 0) {
    if (!this.alive) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, IMAGES[this.direction], this.x - cameraX, this.y - cameraY);
    ctx.restore();
  }
}
export default Cannon;
```

---

## 18. screens.js

```js
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { SPLASH } from './splashImage.js';

const SPLASH_COLORS = {
  r:'#f44336', o:'#ff9800', y:'#ffeb3b', g:'#4caf50',
  b:'#1565c0', p:'#f4c2a1', d:'#212121', w:'#ffffff',
  k:'#111111', s:'#aaaaaa', u:'#c8a06e', _: null,
};

const drawSplash = (ctx, x, y, blockSize) => {
  SPLASH.forEach((row, ry) => row.forEach((cell, cx) => {
    const color = SPLASH_COLORS[cell];
    if (!color) return;
    ctx.fillStyle = color;
    ctx.fillRect(x + cx * blockSize, y + ry * blockSize, blockSize, blockSize);
  }));
};

const SPLASH_BLOCK = 3;
const SPLASH_H = 37 * SPLASH_BLOCK;   // 111 px
const TEXT_CX  = 170;
const SPLASH_X = 320;
const SPLASH_Y = Math.round((CANVAS_HEIGHT - SPLASH_H) / 2);

export const drawStartScreen = (ctx, startButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.92)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawSplash(ctx, SPLASH_X, SPLASH_Y, SPLASH_BLOCK);
  ctx.fillStyle = '#ff1744'; ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('CONTRA', TEXT_CX, 52);
  ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(TEXT_CX - 100, 62); ctx.lineTo(TEXT_CX + 100, 62); ctx.stroke();
  ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 13px monospace';
  ctx.fillText('— HOW TO PLAY —', TEXT_CX, 82);
  const rows = [['← →','Move left / right'],['Space','Jump'],['↑ + Z','Shoot up'],
                ['↓','Squat'],['Z','Shoot'],['P','Pause / resume']];
  ctx.font = '12px monospace'; let ry = 100;
  for (const [key, desc] of rows) {
    ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText(key, TEXT_CX - 8, ry);
    ctx.fillStyle = '#aaa'; ctx.textAlign = 'left';  ctx.fillText(desc, TEXT_CX + 8, ry);
    ry += 20;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4caf50'; ctx.font = 'bold 11px monospace';
  ctx.fillText('Reach the flag to advance.', TEXT_CX, ry + 10);
  ctx.fillStyle = '#888'; ctx.font = '11px monospace';
  ctx.fillText('1 hit = death  •  7 lives  •  2 levels', TEXT_CX, ry + 26);
  startButton.y = CANVAS_HEIGHT - 25; startButton.x = TEXT_CX + 65;
  startButton.draw(ctx);
  ctx.restore();
};

export const drawPauseOverlay = (ctx) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.font = '14px monospace'; ctx.fillStyle = '#aaa';
  ctx.fillText('[P] to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.restore();
};

export const drawGameOverScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ff1744'; ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
  ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
  restartButton.draw(ctx);
  ctx.restore();
};

export const drawWinScreen = (ctx, score, restartButton) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('MISSION COMPLETE!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
  ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
  restartButton.draw(ctx);
  ctx.restore();
};
```

---

## 19. game.js

```js
import { BaseGame, isCollision } from './gamedoh-engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE, HEART_BEAT, LIVES,
         INITIAL_SPEED, MAX_SPEED, SPEED_UP_EVERY, WORLD_WIDTH, WORLD_HEIGHT, LEVELS_DATA } from './constants.js';
import Level from './level.js';
import { drawBackground, drawTerrain, getTerrain } from './terrain.js';
import { drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen } from './screens.js';

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, { canvasWidth: CANVAS_WIDTH, canvasHeight: CANVAS_HEIGHT,
      blockSize: BLOCK_SIZE, heartbeat: HEART_BEAT, lives: LIVES,
      initialSpeed: INITIAL_SPEED, maxSpeed: MAX_SPEED, speedUpEvery: SPEED_UP_EVERY });
    this.level       = new Level(this);
    this.player      = null; this.soldiers = []; this.bullets = []; this.cannons = []; this.flags = [];
    this.cameraX     = 0; this.cameraY = 0; this.worldBottom = CANVAS_HEIGHT + 20;
    this._timerStarted = false; this._levelBanner = 0; this._playerDead = false; this._terrain = [];
    this._lastAliveX = null; this._lastAliveY = null;
  }

  get _levelData()  { return LEVELS_DATA[this.level.index]; }
  get _isVertical() { return this._levelData.type === 'vertical'; }

  setupTerrain() {
    this._terrain    = getTerrain(this._levelData);
    this.worldBottom = this._isVertical ? WORLD_HEIGHT + 20 : CANVAS_HEIGHT + 20;
  }

  _update() {
    if (!this._timerStarted) { this._timerStarted = true; this.level.startTimer(); }

    if (this._levelBanner > 0) {
      this._levelBanner--;
      this.level._timeUp = false;
      if (this._levelBanner === 0) {
        this.level._createTimer(); this.level.startTimer(); this.setupTerrain();
        if (this.onLevelSetup) this.onLevelSetup();
      }
      return;
    }

    if (this.level._timeUp) {
      this.level._timeUp = false; this.level._done = true;
      this.lives = 1; this.loseLife(); return;
    }

    this._playerDead = false;
    const pl = this.player;
    if (!pl._dead) { this._lastAliveX = pl.x; this._lastAliveY = pl.y; }
    pl.update(this._terrain);

    if (this._isVertical) {
      this.cameraX = 0;
      this.cameraY = Math.max(0, Math.min(pl.y - CANVAS_HEIGHT * 2 / 3, WORLD_HEIGHT - CANVAS_HEIGHT));
    } else {
      this.cameraY = 0;
      this.cameraX = Math.max(0, Math.min(pl.x - CANVAS_WIDTH / 3, WORLD_WIDTH - CANVAS_WIDTH));
    }

    for (const c of this.cannons) c.update(this.bullets);
    for (const s of this.soldiers) s.update(pl, this.bullets, this._terrain);
    this.soldiers = this.soldiers.filter(s => s.alive);
    for (const b of this.bullets) b.update();
    this.bullets = this.bullets.filter(b => b.alive);

    if (this._playerDead) return;

    // Player bullets vs soldiers
    for (const b of this.bullets) {
      if (b.owner !== 'player') continue;
      for (const s of this.soldiers) {
        if (!s._dead && isCollision(b, s)) { b.alive = false; s.hit(); this.shake.trigger(); break; }
      }
    }

    // Player bullets vs flags
    for (const b of this.bullets) {
      if (b.owner !== 'player') continue;
      for (const f of this.flags) {
        if (f.alive && isCollision(b, f)) { b.alive = false; f.alive = false; this.score += 10; break; }
      }
    }

    // Player walks into flags
    for (const f of this.flags) {
      if (f.alive && !pl._dead && isCollision(pl, f)) { f.alive = false; this.score += 10; }
    }
    this.flags = this.flags.filter(f => f.alive);

    // Player bullets vs cannons
    for (const b of this.bullets) {
      if (b.owner !== 'player') continue;
      for (const c of this.cannons) {
        if (c.alive && isCollision(b, c)) { b.alive = false; c.alive = false; this.score += 5; this.shake.trigger(); break; }
      }
    }
    this.cannons = this.cannons.filter(c => c.alive);

    // Enemy bullets vs player
    if (!pl._dead && !pl.flash.active) {
      for (const b of this.bullets) {
        if (b.owner !== 'enemy') continue;
        if (isCollision(b, pl)) { b.alive = false; pl.die(); this.shake.trigger(); return; }
      }
    }

    // Win condition
    if (!pl._dead) {
      if (this._isVertical  && pl.y <= this._levelData.endY) this.level.reachEnd();
      if (!this._isVertical && pl.x + pl.width >= this._levelData.endX) this.level.reachEnd();
    }
  }

  _drawWorld() {
    const { ctx, cameraX, cameraY } = this;
    drawBackground(ctx, cameraX, cameraY, this._isVertical);
    drawTerrain(ctx, this._levelData, cameraX, cameraY);
    for (const f of this.flags)    f.draw(ctx, cameraX, cameraY);
    for (const c of this.cannons)  c.draw(ctx, cameraX, cameraY);
    for (const s of this.soldiers) s.draw(ctx, cameraX, cameraY);
    for (const b of this.bullets)  b.draw(ctx, cameraX, cameraY);
    if (this.player) this.player.draw(ctx, cameraX, cameraY);

    if (this._levelBanner > 0) {
      const num = Math.ceil(this._levelBanner / 30);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff'; ctx.font = 'bold 38px monospace';
      ctx.fillText(`LEVEL ${this.level.index + 1}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 80px monospace';
      ctx.fillText(num, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.restore();
    }
  }

  drawHUD() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, CANVAS_WIDTH, 30);
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    for (let i = 0; i < this.lives; i++) {
      ctx.fillStyle = '#e53935'; ctx.fillText('♥', 8 + i * 16, 15);
    }
    const secs = Math.ceil(this.level._remaining ?? 0);
    ctx.textAlign = 'center'; ctx.fillStyle = secs <= 5 ? '#ff5252' : '#fff';
    ctx.fillText(`LVL ${this.level.index + 1}   TIME: ${secs}s`, CANVAS_WIDTH / 2, 15);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ffeb3b';
    ctx.fillText(`SCORE: ${this.score}`, CANVAS_WIDTH - 10, 15);
    ctx.restore();
  }

  loseLife() { this._playerDead = true; super.loseLife(); if (this.onLoseLife) this.onLoseLife(); }
  win() { super.win(); }
  drawStartScreen()    { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay()   { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton); }
  drawWinScreen()      { drawWinScreen(this.ctx, this.score, this.restartButton); }
}
export default Game;
```

---

## 20. main.js

```js
import Game from './game.js';
import Player from './player/index.js';
import Soldier from './soldier/index.js';
import Cannon, { CANNON_W, CANNON_H } from './cannon/index.js';
import Flag, { FLAG_W, FLAG_H } from './flag.js';
import inputHandler from './inputHandler.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_W, PLAYER_H, SOLDIER_H, GROUND_Y,
         WORLD_HEIGHT, LEVELS_DATA, INVINCIBLE_FRAMES, LIVES } from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');
const game = new Game(ctx, { canvas });

const spawnPlayer = () => {
  const levelData = LEVELS_DATA[game.level.index];
  const startY = levelData.type === 'vertical' ? WORLD_HEIGHT - PLAYER_H - 20 : GROUND_Y - PLAYER_H;
  game.player = new Player(game, 50, startY);
};

const spawnSoldiers = () => {
  const levelData = LEVELS_DATA[game.level.index];
  game.soldiers = levelData.soldiers.map(s =>
    typeof s === 'number'
      ? new Soldier(game, s, GROUND_Y - SOLDIER_H)
      : new Soldier(game, s.x, s.y - SOLDIER_H)
  );
};

const spawnCannons = () => {
  const levelData = LEVELS_DATA[game.level.index];
  const cannons = [];
  if (levelData.type === 'vertical') {
    for (const p of levelData.platforms) {
      if (p.w >= CANNON_W && Math.random() < 0.6) {
        const cx = p.x + Math.floor(Math.random() * (p.w - CANNON_W));
        cannons.push(new Cannon(game, cx, p.y - CANNON_H));
      }
    }
  } else {
    for (let x = 250; x < levelData.endX - 100; x += 500)
      cannons.push(new Cannon(game, x + Math.floor(Math.random() * 80), GROUND_Y - CANNON_H));
    for (const p of levelData.platforms) {
      if (p.w >= CANNON_W && Math.random() < 0.5) {
        const cx = p.x + Math.floor(Math.random() * (p.w - CANNON_W));
        cannons.push(new Cannon(game, cx, p.y - CANNON_H));
      }
    }
  }
  game.cannons = cannons;
};

const spawnFlags = () => {
  const levelData = LEVELS_DATA[game.level.index];
  const spots = [];
  if (levelData.type === 'vertical') {
    for (const p of levelData.platforms) {
      if (p.w >= FLAG_W) spots.push({ x: p.x + Math.floor(Math.random() * (p.w - FLAG_W)), y: p.y - FLAG_H });
    }
  } else {
    for (let x = 180; x < levelData.endX - 100; x += 350)
      spots.push({ x: x + Math.floor(Math.random() * 60), y: GROUND_Y - FLAG_H });
    for (const p of levelData.platforms) {
      if (p.w >= FLAG_W) spots.push({ x: p.x + Math.floor(Math.random() * (p.w - FLAG_W)), y: p.y - FLAG_H });
    }
  }
  spots.sort(() => Math.random() - 0.5);
  game.flags = spots.slice(0, 6).map(s => new Flag(s.x, s.y));
};

const resetCamera = () => {
  game.cameraX = 0; game.cameraY = 0;
  game.worldBottom = LEVELS_DATA[game.level.index].type === 'vertical' ? WORLD_HEIGHT + 20 : CANVAS_HEIGHT + 20;
};

const setupGame = () => {
  game.level.reset();
  game._timerStarted = false; game._levelBanner = 0;
  game._lastAliveX = null; game._lastAliveY = null;
  game.bullets = [];
  resetCamera(); game.setupTerrain();
  spawnPlayer(); spawnSoldiers(); spawnCannons(); spawnFlags();
};

game.onLevelSetup = () => {
  game.lives = LIVES; game._lastAliveX = null; game._lastAliveY = null;
  game.bullets = []; resetCamera();
  spawnPlayer(); spawnSoldiers(); spawnCannons(); spawnFlags();
};

game.onLoseLife = () => {
  if (game.lives > 0) {
    game.bullets = game.bullets.filter(b => b.owner !== 'player');
    if (game._lastAliveX != null) {
      game.player = new Player(game, game._lastAliveX, game._lastAliveY);
    } else {
      spawnPlayer();
    }
    game.player.flash.trigger(INVINCIBLE_FRAMES);
  }
};

game.onRestart = setupGame;

setupGame();
inputHandler(game);

const loadAssets = () => new Promise(resolve => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve);
});

(async () => {
  await loadAssets();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  game.init();
})();
```

---

## 21. Step-by-Step Build Prompts for Claude

Use these prompts **in order** in a fresh Claude conversation. Each builds on the previous.

```
PROMPT 1 — Project setup
"Create a browser-based Contra-style game in the current directory using vanilla JS and HTML5
Canvas. No build step. ES6 modules only. Create index.html exactly as specified in the CLAUDE.md
Section 6. Create constants.js with all exports from Section 5."

PROMPT 2 — Engine + sounds
"Copy gamedoh-engine.js from ../gamedoh-framework/ (adjust the re-export path to wherever the
framework lives). Create sounds.js exactly as in Section 9."

PROMPT 3 — Core helpers: terrain, bullet, flag
"Create terrain.js, bullet.js, and flag.js exactly as specified in Sections 10, 8, and 12
(flag sprite is in Section 12 under flag.js)."

PROMPT 4 — Cannon
"Create cannon/images.js and cannon/index.js exactly as specified in Sections 12 and 17."

PROMPT 5 — Player
"Create player/images.js with all four sprite arrays from Section 12. Create player/states.js
and player/index.js exactly as in Section 15."

PROMPT 6 — Soldier
"Create soldier/images.js (copy exact arrays from soldier/images.js source).
Create soldier/states.js and soldier/index.js exactly as in Section 16."

PROMPT 7 — Level + input
"Create level.js and inputHandler.js exactly as specified in Sections 14 and 13."

PROMPT 8 — Splash image
"Create splashImage.js: export const SPLASH = [copy exact 37×64 array from splashImage.js]"

PROMPT 9 — Screens
"Create screens.js exactly as specified in Section 18."

PROMPT 10 — Game class
"Create game.js exactly as specified in Section 19."

PROMPT 11 — Main wiring
"Create main.js exactly as specified in Section 20. Then run `npx serve .` and open
http://localhost:3000/index.html to verify the game loads, shows the start screen,
and all controls work."
```

### Verification checklist
- [ ] Start screen shows CONTRA title + splash image + controls
- [ ] Click START → Level 1 begins, horizontal scrolling, HUD shows 7 hearts + timer
- [ ] Arrow keys move, Space jumps, Z shoots, ↑+Z shoots up, ↓ squats, P pauses
- [ ] Soldier walks toward player and shoots
- [ ] Cannon rotates and shoots in 4 directions
- [ ] Flag collected by walking into or shooting (+10 pts)
- [ ] Reach endX (x=1300) → 3-2-1 banner → Level 2 starts, lives refresh to 7
- [ ] Level 2 camera scrolls upward as player climbs platforms
- [ ] Player alternates between left (x=100–320) and right (x=280–500) platforms
- [ ] Death → respawn at last alive position with invincibility flash
- [ ] Reach endY (y=380) in Level 2 → MISSION COMPLETE screen
- [ ] Game over if all 7 lives lost on any level
