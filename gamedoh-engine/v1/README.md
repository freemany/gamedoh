# jsKidz GameDoh Framework

Reusable building blocks extracted from the jsKidz games (Space Invaders, Doodle Jump, Searching Carrot).
Copy what you need — each file is standalone.

---

## Camera.js

2D scrolling viewport for large worlds. Keeps an entity centred on screen while clamping to world boundaries.

```js
import Camera from './Camera.js';

const camera = new Camera({
  worldWidth:  300,  // total world width  (grid units or pixels)
  worldHeight: 300,  // total world height (grid units or pixels)
  viewWidth:   120,  // viewport width     (same units as world)
  viewHeight:  120,  // viewport height    (same units as world)
});

// Call every frame — centres the viewport on the target position
camera.follow(player.worldX, player.worldY);

// Snap back to world origin (e.g. on level reset)
camera.reset();

// camera.x / camera.y — top-left corner of the viewport in world units
// Convert to screen pixels when drawing:
//   screenX = (entity.worldX - camera.x) * blockSize
```

**Units:** use whichever unit system your game uses (grid units or pixels) consistently for
`worldWidth`/`viewWidth` and entity positions.

**Clamping:** when the target is near a world edge, the camera stops and the entity keeps moving
toward the edge on screen.

**Grid-unit example** (searching-carrot pattern — world is in grid units, `blockSize` converts to pixels):

```js
// setup
this.camera = new Camera({
  worldWidth:  WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  viewWidth:   CANVAS_WIDTH  / BLOCK_SIZE,
  viewHeight:  CANVAS_HEIGHT / BLOCK_SIZE,
});
this.camera.follow(WORLD_WIDTH / 2, WORLD_HEIGHT / 2); // start centred

// draw entity
const screenX = (entity.worldX - this.camera.x) * blockSize;
const screenY = (entity.worldY - this.camera.y) * blockSize;
drawShape(ctx, blockSize, entity.image, screenX, screenY);
```

---

## utils.js

Canvas drawing helpers and general utilities.

```js
import { drawGrid, drawShape, isCollision, getRandomNumber, shuffle, delay } from './utils.js';
```

| Function                                  | Description                                          |
| ----------------------------------------- | ---------------------------------------------------- |
| `drawGrid(ctx, width, height, blockSize)` | Draws a light-grey grid over the canvas              |
| `drawShape(ctx, blockSize, image, x, y)`  | Renders a 2D color-code array as pixel art           |
| `isCollision(a, b)`                       | AABB collision — entities need `x, y, width, height` |
| `getRandomNumber(range)`                  | Random integer from 0 to range-1                     |
| `shuffle(arr)`                            | Fisher-Yates shuffle, returns new array              |
| `delay(ms)`                               | Promise-based timeout: `await delay(1000)`           |

### Sprite color codes

`drawShape` maps single characters to fill colors:

| Code | Color                   |
| ---- | ----------------------- |
| `r`  | red                     |
| `i`  | pink                    |
| `o`  | orange                  |
| `b`  | blue                    |
| `l`  | lightblue               |
| `g`  | green                   |
| `d`  | black                   |
| `y`  | yellow                  |
| `p`  | purple                  |
| `e`  | grey                    |
| `w`  | white                   |
| `_`  | (transparent — skipped) |

---

## constants.js

Shared game state enum.

```js
import { GAME_STATE } from './constants.js';

// Values: START | PLAYING | PAUSED | OVER
this.state = GAME_STATE.START;
```

---

## Button.js

A green text button drawn on the canvas. Used for PAUSE/PLAY controls.

```js
import Button from './Button.js';

const pauseButton = new Button({
  x: canvas.width - 10,
  y: canvas.height - 10,
  game,
  text: 'PAUSE',
  width: 60, // optional, default 60
  height: 20, // optional, default 20
});

pauseButton.draw(ctx);
pauseButton.setText('PLAY');
pauseButton.isClicked(clickX, clickY); // returns boolean
```

The button is anchored at `(x, y)` as the bottom-right corner, so it draws leftward/upward.

---

## Image.js

Sprite animation controller. Cycles through an array of 2D frame arrays.

```js
import Image from './Image.js';

const frames = [
  [
    ['_', 'r', '_'],
    ['r', 'r', 'r'],
  ], // frame 0
  [
    ['r', '_', 'r'],
    ['r', 'r', 'r'],
  ], // frame 1
];

const sprite = new Image(frames);

sprite.getImage(); // current 2D frame array
sprite.getWidth(); // columns in frame 0
sprite.getHeight(); // rows in frame 0
sprite.next(); // advance to next frame (wraps around)
```

Use with `drawShape` to render the current frame:

```js
drawShape(ctx, game.blockSize, sprite.getImage(), x * blockSize, y * blockSize);
sprite.next(); // call each game tick to animate
```

---

## State.js

Abstract base class for the state machine pattern. Entities own their state transitions.

```js
import State from './State.js';

class Jumping extends State {
  constructor(player) {
    super(player, 'JUMPING');
  }

  enter() {
    jumpSound.currentTime = 0;
    jumpSound.play();
  }

  getGravity() {
    return GRAVITY * 0.8;
  }
  getImage() {
    return JUMP_FRAME;
  }
}
```

Add `enterState` to your entity class with a guard to prevent re-entering the same state:

```js
class Player {
  constructor() {
    this.states = {
      IDLE: new Idle(this),
      JUMPING: new Jumping(this),
    };
    this.enterState('IDLE');
  }

  enterState(state) {
    if (this.currentState?.state === state) return; // guard
    this.currentState = this.states[state];
    this.currentState.enter();
  }
}
```

### State interface

| Method         | Purpose                                                      |
| -------------- | ------------------------------------------------------------ |
| `enter()`      | Side effects when entering the state (play sound, set flags) |
| `getImage()`   | Return sprite frame array for this state                     |
| `getGravity()` | Return gravity modifier for physics entities                 |

---

## Level.js

Manages level progression — index, entity count per level, label rendering, and per-level gameplay timer.

```js
import Level from './Level.js';

// LEVELS can be an array of numbers or objects { carrotCount, timeLimit }
const LEVELS = [
  { carrotCount: 1, timeLimit: 10 },
  { carrotCount: 3, timeLimit: 20 },
];
const LEVEL_TIMEOUT = 3000; // countdown duration in ms

const level = new Level(game, LEVELS, LEVEL_TIMEOUT);

level.number;        // current level number (1-based)
level.alienCount;    // entity count for current level (levels[index].carrotCount or levels[index])
level.timeLimit;     // time limit for current level (levels[index].timeLimit)
level.timeRemaining; // seconds left on the gameplay timer
level.isLast();      // true if on the final level
await level.next();  // advance: shows LevelIntro → Countdown → fires onLevelSetup
level.reset();       // back to index 0
level.draw();        // renders "Level N" label top-right on canvas

// Per-level gameplay timer (GameTimer-based, driven by game loop)
level.startTimer(seconds, heartbeat, onExpire); // start countdown for current level
level.updateTimer(); // call every game loop tick to advance the timer
level.cancelTimer(); // stop and reset the timer
```

`level.next()` expects `game.onLevelSetup(count)` callback to be set — it calls this after the
transition animations complete. It also toggles `game.transitioning` to prevent game logic
from running during the transition.

---

## LevelIntro.js

Full-screen "Level N — Get Ready!" overlay. Shown before a new level starts.

```js
import LevelIntro from './LevelIntro.js';

await new LevelIntro(game, levelNumber, 2000).start();
```

- Sets `game.transitionRenderer` while active so the main game loop renders it
- Clears `game.transitionRenderer` and resolves the Promise after `duration` ms

---

## Countdown.js

Circled countdown number at canvas centre. Shown after LevelIntro, before gameplay resumes.

```js
import Countdown from './Countdown.js';

await new Countdown(game, 3).start(); // counts 3 → 2 → 1
```

- Uses `Timer` internally to tick once per second
- Sets `game.transitionRenderer` each tick so the main loop renders the current number
- Resolves the Promise when the count reaches 0

---

## Timer.js

Promise-based countdown that fires a callback each second. Used internally by `Countdown`.

```js
import Timer from './Timer.js';

const timer = new Timer(5); // 5 seconds

await timer.start((remaining) => {
  console.log(remaining); // 5, 4, 3, 2, 1
});
// resolves when count reaches 0

timer.cancel(); // stop early
```

---

## GameTimer.js

Game-loop-driven countdown. Must call `update()` every tick. Supports pause, cancel, and restart.
Unlike `Timer`, it stays in sync with the game loop — pausing automatically when the loop stops.

```js
import GameTimer from './GameTimer.js';

const timer = new GameTimer(
  30,           // seconds
  100,          // heartbeat — game loop interval in ms
  (remaining) => console.log(remaining), // onTick — called each second
  () => console.log('time up!')          // onExpire — called when done
);

timer.start();   // begin countdown
timer.update();  // call every game loop tick
timer.pause();   // freeze countdown
timer.cancel();  // stop and reset to 0
timer.restart(); // reset to initial seconds and resume
```

Requires `game.heartbeat` (or pass it directly) to accumulate real elapsed time per tick.

---

## PixelButton.js

A pixel-art button rendered via a 2D sprite array. Supports click detection.

```js
import PixelButton from './PixelButton.js';

const button = new PixelButton({
  x: 21,          // grid units from left
  y: 18,          // grid units from top
  game,           // needs game.blockSize
  imageArr: START_IMAGE, // 2D color-code array
});

button.draw(ctx);
button.isClicked(clickX, clickY); // returns boolean — use with canvas click event
```

---

## Patterns

### Tick-based timing

`Game` increments `this.tick` every interval (100ms). Use modulo to throttle actions:

```js
// Fire a bullet at most once every 3 ticks
if (game.tick % 3 === 0) {
  this.shoot();
}
```

### Callback pattern

`Game` exposes optional callbacks set from `main.js` for loose coupling:

```js
// main.js
game.onRestart = () => {
  game.spaceShip = new SpaceShip({ ... });
  game.aliens = createAliens(game.level.alienCount);
};

game.onLevelSetup = (alienCount) => {
  game.aliens = createAliens(alienCount);
};
```

### transitionRenderer hook

During level transitions, `Level`, `LevelIntro`, and `Countdown` write a render function to
`game.transitionRenderer`. The game loop calls it every tick:

```js
// Inside game loop:
if (this.transitionRenderer) {
  this.transitionRenderer();
}
```

This keeps transition drawing decoupled from the main loop without stopping the interval.
