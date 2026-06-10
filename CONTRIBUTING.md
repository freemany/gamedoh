# Contributing to gamedoh

Thanks for wanting to add a game or improve the engine! Here's everything you need to know.

## Running Locally

No build step required — games are plain HTML + ES modules.

```bash
# From the repo root
npx serve .

# Then open any game in your browser, e.g.
# http://localhost:3000/games/starter-kit/index.html
```

## Adding a New Game

1. **Copy the starter-kit** into a new folder under `games/`:

   ```bash
   cp -r games/starter-kit games/my-game
   ```

2. **Follow the starter-kit guide** — read `games/starter-kit/CLAUDE.md` for the full architecture and patterns.

3. **Keep your imports local** — every game must have its own `gamedoh-engine.js` that re-exports the framework. Never import directly from the CDN URL in your game files:

   ```js
   // good
   import { BaseGame, drawShape } from './gamedoh-engine.js';

   // bad
   import BaseGame from 'https://jskidz.au/gamedoh-engine/v1/Game.js';
   ```

4. **Add your game to the gallery** — update `index.html` at the repo root with a card for your game (copy an existing card and update the name, description, folder, and color).

## Offline / Local Framework Development

The `gamedoh-engine.js` file in each game imports the framework from the CDN by default. To use the local copy instead (for offline work or framework development), change the base URL:

```js
// CDN (default)
import BaseGame from 'https://jskidz.au/gamedoh-engine/v1/Game.js';

// Local (for offline / framework development)
import BaseGame from '../../gamedoh-engine/v1/Game.js';
```

The local framework lives at `games/gamedoh-engine/v1/` — the folder structure mirrors the CDN path exactly.

## Code Style

This project uses [Prettier](https://prettier.io/). Config is at `.prettierrc`:

- Single quotes
- Semicolons
- 2-space indentation
- 100 character line width

Format before committing:

```bash
npx prettier --write games/my-game/
```

## Pull Request Guidelines

- One game or one focused change per PR
- The game must be playable end-to-end (start screen → gameplay → game over / win)
- Must include a `gamedoh-engine.js` (never raw CDN imports in game files)
- Run prettier before submitting

## Framework Changes

Changes to `games/gamedoh-engine/v1/` affect every game that uses the CDN. Please open an issue first to discuss before modifying framework files.
