# Build Your First gamedoh Game

This tutorial walks you through building a simple game from scratch using the gamedoh engine. By the end, you'll have a moving character that collects items — the foundation for any game.

**Prerequisites**: Basic JavaScript knowledge (variables, functions, classes). No game dev experience needed.

---

## Step 0: Get Set Up

Copy the starter-kit to a new folder:

```bash
cp -r games/starter-kit games/my-first-game
```

Start a local server from the repo root:

```bash
npx serve .
```

Open `http://localhost:3000/games/my-first-game/index.html` — you should see a dark canvas with "Press ENTER to start".

All the wiring is already done. You'll spend your time in these files:
- `constants.js` — all your numbers go here
- `game.js` — what happens each frame
- `main.js` — create your entities here

---

## Step 1: The Game Loop

Every game is a loop that runs ~30 times per second. Each iteration:

1. **Update** — move entities, check collisions, handle input
2. **Draw** — clear the canvas, draw everything

In gamedoh, `BaseGame` handles the loop for you. You override `_update()` and `_drawWorld()`:

```js
// game.js
class Game extends BaseGame {
  _update() {
    // called every frame while PLAYING
    this.player.update();
  }

  _drawWorld() {
    // called every frame — draw your entities here
    this.player.draw(this.ctx);
  }
}
```

You never call `_update()` or `_drawWorld()` yourself — `BaseGame` calls them at the right time.

---

## Step 2: Draw a Sprite

gamedoh uses **pixel-art sprites** defined as 2D arrays of color codes:

```js
const MY_SPRITE = [
  ['_', 'r', 'r', '_'],  // _ = transparent, r = red
  ['r', 'r', 'r', 'r'],
  ['_', 'r', 'r', '_'],
];
```

Color codes: `r`=red, `b`=blue, `g`=green, `y`=yellow, `w`=white, `d`=black, `o`=orange, `_`=transparent.

Draw it on the canvas with `drawShape`:

```js
import { drawShape } from './gamedoh-engine.js';

// drawShape(ctx, blockSize, spriteArray, gridX, gridY)
drawShape(ctx, 5, MY_SPRITE, 10, 10);
// Draws the sprite at grid position (10, 10), each cell = 5px
```

**In a real game**, sprites go in their own file (e.g. `playerImage.js`) and are imported where needed.

---

## Step 3: Create an Entity

An entity is a plain class that holds position and knows how to `update()` and `draw()`.

```js
// player.js
import { drawShape } from './gamedoh-engine.js';
import { PLAYER_SPRITE } from './playerImage.js';
import { BLOCK_SIZE } from './constants.js';

class Player {
  constructor(game) {
    this.game = game;
    this.x = 10;   // grid units
    this.y = 10;
    this.width = 4;
    this.height = 6;
  }

  update() {
    // movement logic goes here
  }

  draw(ctx) {
    drawShape(ctx, BLOCK_SIZE, PLAYER_SPRITE, this.x, this.y);
  }
}

export default Player;
```

Create it in `main.js` and attach it to the game:

```js
// main.js
const setupGame = () => {
  game.player = new Player(game);
};
```

Then draw it in `game.js`:

```js
_drawWorld() {
  this.player.draw(this.ctx);
}
```

---

## Step 4: Handle Keyboard Input

`inputHandler.js` listens to key events and stores which keys are currently held down in `game._keys`:

```js
// inputHandler.js (already in starter-kit)
const inputHandler = (game) => {
  game._keys = {};
  document.body.addEventListener('keydown', (e) => { game._keys[e.key] = true; });
  document.body.addEventListener('keyup', (e) => { game._keys[e.key] = false; });
};
```

In `game.js`, read `_keys` each frame to move the player:

```js
_update() {
  const k = this._keys;
  if (k['ArrowLeft'])  this.player.x -= 1;
  if (k['ArrowRight']) this.player.x += 1;
  if (k['ArrowUp'])    this.player.y -= 1;
  if (k['ArrowDown'])  this.player.y += 1;
}
```

---

## Step 5: Add Collision Detection

`isCollision` checks if two entities overlap (AABB — axis-aligned bounding box):

```js
import { isCollision } from './gamedoh-engine.js';

// Both entities need x, y, width, height
if (isCollision(this.player, this.coin)) {
  this.score++;
  this.coin.respawn();
}
```

In `game.js`:

```js
_update() {
  // ... input handling ...

  // Check if player collected the coin
  if (isCollision(this.player, this.coin)) {
    this.score++;
    this.coin.x = Math.random() * this.width | 0;
    this.coin.y = Math.random() * this.height | 0;
  }
}
```

---

## Step 6: Show a Score (HUD)

Override `drawHUD()` in `game.js` to draw anything that sits on top of the world (UI layer):

```js
drawHUD() {
  const { ctx, blockSize } = this;
  ctx.save();
  ctx.fillStyle = 'white';
  ctx.font = `${blockSize * 3}px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${this.score}`, blockSize * 2, blockSize);
  ctx.restore();
}
```

Always wrap canvas state changes in `ctx.save()` / `ctx.restore()` — it prevents styles leaking between draw calls.

---

## Step 7: Add a Second Level

Create `level.js` to manage progression:

```js
// level.js
import { Level as FrameworkLevel, LevelIntro } from './gamedoh-engine.js';
import { LEVELS } from './constants.js';

class Level extends FrameworkLevel {
  constructor(game) {
    super(game, LEVELS, null);
  }

  advance() {
    if (this.isLast()) {
      this.game.win();
    } else {
      this.index++;
      new LevelIntro(this.game, this.index + 1).start().then(() => {
        if (this.game.onLevelSetup) this.game.onLevelSetup();
      });
    }
  }
}

export default Level;
```

In `constants.js`:

```js
export const LEVELS = [
  { coinCount: 3 },
  { coinCount: 6 },
  { coinCount: 10 },
];
```

When the player collects all coins, call `this.level.advance()`. The `LevelIntro` overlay plays automatically, then `onLevelSetup` fires so `main.js` can reset the coins.

---

## What's Next?

- **State machine**: for characters with multiple animations (walk, jump, attack) — see `games/offline-dino/tRex.js`
- **Camera**: for worlds larger than the screen — see `games/searching-carrot2/game.js`
- **Gravity**: update `vy` each frame, apply `vy` to `y`, reset `vy` on ground contact — see `games/doodle-jump/player.js`
- **Tilemap**: grid-based level layouts — see `games/super-mario/`
- **Audio**: use `<audio>` tags in `index.html` and call `.play()` / `.pause()` from JavaScript

For a complete reference of every pattern in the engine, read [`CLAUDE.md`](CLAUDE.md) in this folder.

---

## Stuck?

- The gamedoh framework docs are in [`games/gamedoh-engine/v1/README.md`](../gamedoh-engine/v1/README.md)
- Look at a working game — `games/searching-carrot2/` is the simplest complete game using the full pattern
- Open the repo in Claude Code and ask: *"Explain how the game loop works in gamedoh"*
