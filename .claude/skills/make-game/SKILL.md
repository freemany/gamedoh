---
name: make-game
description: Create a complete playable GameDoh game from the user's game idea using the repository starter-kit and GameDoh conventions.
---

# Make a GameDoh Game

Create a complete playable browser game using the GameDoh engine.

## Get the game information

If the user has not already provided a game name, ask: "What is the name of your game?"

If the user has not already described the game, ask: "Describe the game you want to create and any features you want."

If both were already supplied with `/make-game`, do not ask again. Do not require technical implementation details.

## Read GameDoh instructions first

Before coding:
1. Read `games/starter-kit/CLAUDE.md`.
2. Inspect `games/starter-kit/`.
3. Follow its architecture and GameDoh conventions.
4. Inspect other games only when useful for a requested mechanic.

Do not modify `games/starter-kit/`.

## Create a safe game folder

Keep the user's original game name as the display name. Convert it to lowercase kebab-case for the folder.

Examples:
- `Space Defender` -> `space-defender`
- `Super Snake` -> `super-snake`

Create under `games/<game-folder>/`.

Check whether the folder exists before creating anything. If it exists, never overwrite or modify that existing game. Generate a random 4-character lowercase alphanumeric suffix, append it, and verify the resulting folder is unused.

Example: `games/space-defender-a7k2/`

The suffix is filesystem-only; keep the original game name in the UI. Tell the user if a suffix was added.

## Build the game

Create a complete runnable game, not a partial example. Follow starter-kit patterns for structure, GameDoh engine usage, imports, game loop, rendering, input, state, collisions, constants, assets, restart and game-over behavior.

Use GameDoh rather than inventing another framework. Put tunable values and magic numbers in the appropriate constants/configuration files.

Make sensible game-design decisions for minor unspecified details. Ask only when an important requirement is genuinely ambiguous.

## Verify the game

After implementation:
1. Check imports and file paths.
2. Check for obvious runtime errors.
3. Run relevant repository tests or validation.
4. Fix problems found.
5. Confirm the game can be served normally.

## Serve the game

After verification:
1. Check whether the GameDoh static server is already running on port 3000.
2. Reuse it if it is.
3. Otherwise start the repository from its root with `npx serve .` in a non-blocking/background manner.
4. Do not start another server if port 3000 is already serving GameDoh.
5. Do not stop it unless the user asks.

Expected URL: `http://localhost:3000/games/<game-folder>/` (trailing slash, no `index.html`).

`npx serve .`'s clean-URLs redirect turns a literal `/index.html` request into a double redirect that drops the trailing slash, which breaks every relative import (`./main.js` resolves against the wrong parent). Always give the user the trailing-slash form.

If the server chooses another port, use the actual reported port.

## Finish

Briefly report the game name, created folder, main features, whether the server was started or reused, and the exact local game URL.

After creation, the user may continue naturally prompting for features or changes. Modify the same created game unless they explicitly ask to create another game.
