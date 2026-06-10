# CLAUDE.md — Street Fighters

Design and implementation guide for expanding this game. Read before writing any code.

---

## Current State

Fully playable multi-level beat-em-up. Features implemented:
- Player (white gi) vs CPU enemies across 3 stages
- Punch / kick / crouch / jump with hitbox/hurtbox combat
- Clash sparks (yellow = player hits enemy, orange = enemy hits player)
- Crouch-blocks punches (chip damage); jump dodges kicks
- Jump attacks (JUMP_PUNCH, JUMP_KICK) with extra damage
- Knockback on hit for both player and enemies
- Screen shake on kick landing
- Combo counter with score multiplier
- Score + hi-score persisted in `localStorage`
- 3 lives — KO overlay on death, respawn with full health
- Power-up drops (heart / star / shield) from defeated enemies
- Enemy variety: Grunt (red/blue), Brawler (green, slow/tanky), Rusher (yellow, fast/fragile)
- Fatigue system: spam protection — after 8 consecutive attacks, player locked out 2s with "REST, STEP BACK" text
- Night city background (4-layer parallax: sky, far skyscrapers, mid buildings, front amber windows)
- Game instructions on start screen (two-column layout)
- HUD: hearts, score, hi-score, stage, power-up indicators, quick controls reminder

---

## File Structure

```
street-fighters/
  fighter/
    index.js       — Player class (white gi, health, fatigue, hitbox methods)
    states.js      — Player states: IDLE, WALK, PUNCH, KICK, CROUCH, JUMP, JUMP_PUNCH, JUMP_KICK
    images.js      — Raw 50×50 sprite frames (never modify color codes here)
  enemy/
    index.js       — Enemy class (palette swap, AI loop, type-based stats)
    states.js      — Enemy states: Idle, Walk, Punch, Kick, Stun, Dead
  constants.js     — All tunable values
  game.js          — Game loop, combat, spawning, HUD, background, screens
  inputHandler.js  — Keyboard → fighter state (Z=punch, X=kick, arrows/space)
  level.js         — Level tracker — index, advance(), win()
  screens.js       — showLevelIntro(), showCountdown() — custom overlays
  sounds.js        — Web Audio API synthesised sound effects
  powerup.js       — PowerUp class (heart/star/shield, bobbing animation, AABB pickup)
  spriteUtils.js   — colorizeFrame(frame, map) — palette swap at draw time
  gamedoh-engine.js — CDN re-exports (GameTimer, Image, etc.)
```

---

## Colour System — Sprite Palette Swap

`colorizeFrame(frame, map)` swaps color codes at draw time — no duplicate sprites needed.

- **Player:** `{}` → white gi (no swap)
- **Grunt:** alternates `{ w: 'r' }` red / `{ w: 'b' }` blue each spawn
- **Brawler:** `{ w: 'g' }` green
- **Rusher:** `{ w: 'y' }` yellow

Apply in `draw()` before the facing flip:
```js
let image = this.currentState.getImage();
image = colorizeFrame(image, this._palette);
if (!this.facingRight) image = image.map(row => [...row].reverse());
drawShape(ctx, FIGHTER_BLOCK_SIZE, image, px, py);
```

---

## Enemy Types (`ENEMY_TYPES` in `constants.js`)

| Type    | Color      | speedMult | hpMult | damageMult | cooldownMult | attackRange |
|---------|------------|-----------|--------|------------|--------------|-------------|
| grunt   | red / blue | 1         | 1      | 1          | 1            | 30          |
| brawler | green      | 0.55      | 2.5    | 2          | 1.5          | 42          |
| rusher  | yellow     | 2         | 0.4    | 1          | 0.4          | 30          |

Level configs specify spawn order via `enemyTypes: ['grunt', 'brawler', ...]`.

---

## Combat — Hit Detection

Every fighter has:
- **Hitbox** — attack box (punch or kick). Offsets flip horizontally when facing left.
- **Hurtbox** — body box (always present). Target for opponent's attacks.

```js
PUNCH_HITBOX = { xOffset: 20, yOffset: 5,  width: 18, height: 12 }
KICK_HITBOX  = { xOffset: 18, yOffset: 20, width: 22, height: 12 }
HURTBOX      = { xOffset: 8,  yOffset: 0,  width: 34, height: 50 }
```

**Dodging is built in:**
- **Jump** dodges kicks — kick hitbox is low (yOffset 20), airborne hurtbox clears it
- **Crouch** blocks punches — reduces damage to `BLOCK_DAMAGE = 3` chip

**Clash:** both attacking within 45 grid-units → both cancel, spark shown, no damage.

---

## Fatigue System

Spam protection added to prevent button mashing.

- After `FATIGUE_THRESHOLD = 8` consecutive attacks, player is locked out for `FATIGUE_COOLDOWN_SEC = 2` seconds
- Uses `GameTimer` (from gamedoh-engine) — `_fatigueTimer.update()` called each tick in `fighter.update()`
- `_attackSpree` resets if player doesn't attack for `FATIGUE_SPREE_WINDOW = 8` ticks (~0.8s)
- While fatigued: Z/X inputs ignored in `inputHandler.js`
- "REST, STEP BACK" text drawn above player — starts small/low, bubbles up to larger font/higher position after 3 ticks, drifts backward (opposite facing direction), white border, red fill

---

## Power-ups (`powerup.js`)

Enemies drop on death with `POWERUP_DROP_CHANCE = 0.35` probability.

| Type   | Effect                          |
|--------|---------------------------------|
| heart  | Restore `POWERUP_HEAL = 25` HP  |
| star   | 2× damage for `POWERUP_STAR_TICKS = 50` ticks |
| shield | Full invincibility for `POWERUP_SHIELD_TICKS = 30` ticks |

Player collects by walking over (AABB overlap check in `game._checkPowerups()`).

---

## Level Transitions — Overlay Renderer

This game does not use BaseGame. Use `game.overlayRenderer` (set/cleared by `screens.js`):

```js
// game.run() — always last in render loop
this.overlayRenderer?.();
```

`showLevelIntro()` shows for `LEVEL_INTRO_DURATION = 1000ms`. Countdown (3-2-1) only runs between levels — **not on stage 1 start**.

---

## Audio — `sounds.js`

Web Audio API synthesised tones — no external files needed.

| Sound        | Trigger                        |
|--------------|--------------------------------|
| `punch_throw`| Player enters PUNCH            |
| `kick_throw` | Player enters KICK             |
| `hit_connect`| Attack lands on enemy          |
| `got_hit`    | Player takes damage            |
| `clash`      | Clash or crouch-block          |
| `stun`       | Enemy enters STUN              |
| `enemy_die`  | Enemy enters DEAD              |
| `powerup`    | Player collects a power-up     |

---

## Key Constants (`constants.js`)

```js
// Timing
export const HEART_BEAT            = 100;  // ms per tick
export const LEVEL_INTRO_DURATION  = 1000; // ms stage intro shows
export const STAGE_CLEAR_DELAY     = 0;
export const KO_DISPLAY_MS         = 2000;

// Combat
export const PLAYER_MAX_HEALTH     = 100;
export const PUNCH_DAMAGE          = 15;
export const KICK_DAMAGE           = 20;
export const JUMP_PUNCH_DAMAGE     = 20;
export const JUMP_KICK_DAMAGE      = 25;
export const ATTACK_COOLDOWN_TICKS = 15;
export const BLOCK_DAMAGE          = 3;
export const STUN_TICKS            = 7;
export const KNOCKBACK_VX          = 8;
export const KNOCKBACK_TICKS       = 3;

// Combo / score
export const COMBO_TIMEOUT_TICKS   = 20;

// Lives
export const PLAYER_LIVES          = 3;

// Fatigue
export const FATIGUE_THRESHOLD     = 8;
export const FATIGUE_COOLDOWN_SEC  = 2;
export const FATIGUE_SPREE_WINDOW  = 8;

// Spawning
export const MAX_ENEMIES_ON_SCREEN   = 2;
export const ENEMY_SPAWN_DELAY_TICKS = 15;

// Power-ups
export const POWERUP_DROP_CHANCE   = 0.35;
export const POWERUP_HEAL          = 25;
export const POWERUP_STAR_TICKS    = 50;
export const POWERUP_SHIELD_TICKS  = 30;

// Platforms — empty (removed; background is flat night city street)
export const PLATFORMS = [];
```

---

## Verification Checklist

1. Press ENTER — "STAGE 1" intro shows, no countdown on first stage
2. Player spawns with white gi; enemies spawn from right with type-correct colors
3. Z/X plays punch/kick sound immediately; jump + Z/X fires jump attack
4. Crouch while enemy punches → chip damage only; jump while enemy kicks → miss
5. Attack same time as enemy at close range → CLASH (spark, no damage)
6. Enemy dies → spark, power-up may drop; collect by walking over it
7. Hit 8 attacks in a row → "REST, STEP BACK" appears, attacks locked for 2s
8. Combo counter shows above player; resets on getting hit
9. Score increases with hits; hi-score saved across sessions
10. Player dies with lives remaining → KO overlay → respawn full health
11. Player dies with 0 lives → GAME OVER screen
12. Clear all 3 stages → YOU WIN with score
