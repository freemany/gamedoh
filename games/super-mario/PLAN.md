# Super Mario — Game Plan

## Overview
Pixel-art Super Mario Bros inspired game using the gamedoh-engine framework.
Two levels, 60 seconds each. Mario runs, jumps, stomps Goombas. Horizontal scrolling world.

## Key Constants
- BLOCK_SIZE = 4 (4px per sprite pixel — NES-like scale)
- TILE_SIZE = 16 (grid units per tile = 64px rendered)
- CANVAS: 640 × 384
- HEART_BEAT = 33ms (~30fps for smooth physics)
- LIVES = 3, LEVELS = [60, 60]
- GRAVITY = 0.4 px/frame², JUMP_VY = -9 px/frame
- WORLD_WIDTH = 3200px (5× canvas width)

## File Structure
```
super-mario/
  index.html, gamedoh-engine.js, constants.js
  game.js, main.js, inputHandler.js, level.js, screens.js, sounds.js
  tilemap.js           — tile definitions, level layouts, collision rects
  mario/
    index.js           — Mario entity (physics, state machine, draw)
    images.js          — pixel sprite arrays (idle, walkA, walkB, jump, dead)
    states.js          — IdleState, RunState, JumpState, DeadState
  goomba/
    index.js           — Goomba entity (walk, reverse, stomp/collision)
    images.js          — pixel sprite arrays (walkA, walkB, flat)
```

## Physics (pixel-based)
- Mario x/y stored in pixels (not grid units)
- Gravity applied each frame: vy += GRAVITY
- Tile AABB collision pushes Mario out of solid tiles
- Camera follows Mario: cameraX = mario.x - CANVAS_WIDTH/3

## Scoring
- Goomba stomp: +100 pts
- Survive 1 second: +1 pt

## Controls
- ← → Arrow keys: move left/right
- ↑ Arrow: jump (only when on ground)
- P / Escape: pause
