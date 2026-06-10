# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of browser-based games built with vanilla JavaScript and HTML5 Canvas. Games are designed as educational projects for learning game development concepts.

Games live in the `games/` folder, each in its own subdirectory (e.g., `games/pacman/`, `games/spaceinvaders/`).

## Running Games

Games are standalone HTML/JS applications with no build step. To run a game:

1. Start a local HTTP server (required for ES modules):
   ```bash
   # From the repository root
   npx serve .
   # Or use Python
   python3 -m http.server 8000
   ```

2. Navigate to the game's index.html (e.g., `http://localhost:3000/games/pacman/index.html`)

## Code Style

- Prettier is configured (see `.prettierrc`): single quotes, semicolons, 2-space tabs, 100 char width
- VSCode auto-formats on save

## Architecture

### Game Structure Pattern

Each game follows a consistent architecture:

- **main.js** - Entry point that sets up canvas, creates game objects, and runs the game loop via `setInterval`
- **game.js** - Central Game class that holds shared state (ctx, blockSize, dimensions, game objects)
- **inputHandler.js** - Keyboard event listener that translates arrow keys to directional commands

### Sprite System

Games use a pixel-art sprite system based on 2D character arrays:

- **image.js** - Image class manages sprite animation frames with x/y indices for direction and animation state
- **shape.js** - Base Shape class that all game entities extend; handles drawing via `drawShape()` utility
- **utils.js** - Contains `drawShape()` which renders character arrays to canvas using a color map (e.g., 'r' -> 'red', 'y' -> 'yellow')

Sprites are defined as 2D arrays of single-character color codes (see `pacmanImage.js`, `ghost.js`).

### Game Entity Pattern

Entities (Pacman, Ghost, Fruit, Block) follow this pattern:
- Extend Shape class
- Implement `update()` for game logic (returns `this` for chaining)
- Inherit `draw(ctx)` from Shape
- Store position as `x`, `y` in grid units (multiplied by `blockSize` when drawing)

### Camera System

`gamedoh-framework/Camera.js` provides a reusable 2D scrolling viewport for large worlds.

```js
import Camera from '../gamedoh-framework/Camera.js';

const camera = new Camera({
  worldWidth:  WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  viewWidth:   CANVAS_WIDTH / BLOCK_SIZE,   // grid-unit games
  viewHeight:  CANVAS_HEIGHT / BLOCK_SIZE,
});

// Call each frame to centre viewport on the player
camera.follow(player.worldX, player.worldY);

// Reset to world origin on level restart
camera.reset();
```

Convert world → screen when drawing: `screenX = (entity.worldX - camera.x) * blockSize`.

See `games/gamedoh-framework/README.md` for pixel-unit and grid-unit usage examples.

### Collision Detection

`utils.js:isCollision()` performs AABB collision between entities using their `x`, `y`, `width`, `height` properties.

### Canvas State

Always wrap ctx property changes in `ctx.save()` / `ctx.restore()` to avoid leaking state (font, fillStyle, textAlign, etc.) between draw calls.

### Game State Machine

Game states are defined as constants in `constants.js` (`GAME_STATE`). The `Game` class manages transitions between states (START, PLAYING, PAUSED, OVER).

### Button System

Two button types are available:
- **button.js** - Text button with green background and white text, used for in-game controls (e.g. PAUSE/PLAY)
- **pixelButton.js** - Pixel art button using a 2D image array, used for START and RESTART

Both have `draw(ctx)` and `isClicked(x, y)` methods. Click handling is centralised in `Game.handleClick()`.

### Level System (Space Invaders)

- **level.js** - `Level` class owns all level concerns: current index, alien count per level, label rendering (`draw()`), and progression (`next()`, `reset()`, `isLast()`). Injected with `game` object via constructor so it can access `ctx` and fire `game.onLevelSetup` callback directly.
- **countdown.js** - `Countdown` class displays a circled number at the canvas centre, counting down each second. Returns a Promise so `level.next()` can `await` it between levels.
- **constants.js** - Central file for all configurable values: `LEVELS`, `ALIEN_SCORE`, `MAX_BULLET_COUNT`, `BULLET_SLOWDOWN_BY_TICK`, `LEVEL_TIMEOUT`, `GAME_OVER_TEXT`, `WIN_TEXT`, `START_IMAGE`.

### Tick-based Timing

`Game` tracks a `tick` counter incremented each interval (100ms). Use `game.tick % N === 0` to slow down movement or actions to every N ticks (e.g. bullet fire rate via `BULLET_SLOWDOWN_BY_TICK`).

### Callback Pattern

`Game` exposes optional callbacks set from `main.js`:
- `game.onRestart` — called when the game restarts; recreates spaceship, aliens, and scoreboard
- `game.onLevelSetup(alienCount)` — called by `Level` when advancing to the next level; recreates aliens only

## Simple Component Framework

Apps in `simple-component-framework/` use a jQuery-based component pattern. See `guess-game/` and `audio/` for reference implementations.

### File Structure

- **main.js** — Entry point. Instantiates `App`, calls `render()`. No logic.
- **app.js** — Coordinator. Creates all components, injects dependencies, wires components together via public methods.
- **[component].js** — One class per file. Each component owns its own DOM and behaviour.
- **helper.js** — Pure utility functions with no component dependencies.

### Component Lifecycle

Every component follows the same constructor sequence:

```js
class MyComponent {
  constructor(injectedDependency) {
    this.dep = injectedDependency; // store injected components
    this.$el = $('<div>');          // private — never accessed from outside
    this.init();                    // DOM setup
    this.listeners();               // event binding
  }

  init() { /* build DOM, append children */ }
  listeners() { /* bind events */ }
}
```

### Key Rules

1. **`$el` is private** — never access `component.$el` from outside the component. Use `appendTo()` instead:
   ```js
   // in component
   appendTo($container) { $container.append(this.$el); }

   // in App
   card.appendTo($cardWrap);
   ```

2. **Inject component instances, not jQuery objects** — pass component references between components, not `$el` references:
   ```js
   // correct
   new Dropdown(inputComponent, keywords);

   // wrong
   new Dropdown(this.$search, keywords);
   ```

3. **Communicate via public methods** — child-to-parent via injected reference (`this.app.canClick()`); parent-to-child via method calls (`card.reveal()`). Never reach into another component's internals.

4. **Callbacks for loose coupling** — when a child needs to notify a parent without holding a full reference, use a callback set by the parent:
   ```js
   // in App
   search.onChange((term) => this.list.filter(term));

   // in Search
   this._onChange?.(val);
   ```

### App as Coordinator

`App` does not contain component logic — it wires components together:

```js
class App {
  constructor(selector) {
    this.$el = $(selector);
    this.input = new Input(this.$el.find('input'));
    this.search = new Search(this.input);
    this.list = new List(this.$el.find('.list'));
  }

  async init() {
    await this.list.init();
    this.search.init(this.list.keywords);
    this.search.onChange((term) => this.list.filter(term));
  }

  render() { this.list.render(); }
}
```

### Compilation

Each app can be compiled to a single `index.min.html` with no imports/exports using `node compile.js` from the app's folder. The compile script reads JS files in dependency order, strips module syntax, minifies, and inlines into `index.html`.
