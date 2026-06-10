import { drawShape } from '../gamedoh-engine.js';
import {
  BLOCK_SIZE,
  CANVAS_WIDTH, CANVAS_HEIGHT,
  CELL_W, CELL_H, FORM_GAP, FORM_TOP_Y,
  FORM_ROWS, FORM_COLS,
  TYPE_ZAKOZAKO, TYPE_GOEI, TYPE_BOSS,
  DIVE_SPEED, DIVE_RETURN_SPEED,
  PLAYER_Y,
} from '../constants.js';
import {
  ENTERING, FORMATION, DIVING, TRACTOR, RETURNING, DEAD,
  EnteringState, FormationState, DivingState, TractorState, ReturningState, DeadState,
} from './states.js';

// Formation slot pixel position
function getFormationXY(col, row) {
  const totalW = FORM_COLS * CELL_W + FORM_GAP;
  const leftStart = (CANVAS_WIDTH - totalW) / 2;
  const x = col < 5
    ? leftStart + col * CELL_W + CELL_W / 2
    : leftStart + col * CELL_W + FORM_GAP + CELL_W / 2;
  const y = FORM_TOP_Y + row * CELL_H + CELL_H / 2;
  return { x, y };
}

// Generate entry path waypoints
function makeEntryPath(col, row, side) {
  const { x: fx, y: fy } = getFormationXY(col, row);
  if (side === 'left') {
    return [
      { x: -30, y: 60 },
      { x: 80,  y: 120 },
      { x: 60,  y: 200 },
      { x: fx + 40, y: fy - 40 },
      { x: fx, y: fy },
    ];
  } else {
    return [
      { x: CANVAS_WIDTH + 30, y: 60 },
      { x: CANVAS_WIDTH - 80, y: 120 },
      { x: CANVAS_WIDTH - 60, y: 200 },
      { x: fx - 40, y: fy - 40 },
      { x: fx, y: fy },
    ];
  }
}

// Generate dive path waypoints
function makeDivePath(fromX, fromY, playerX) {
  const loopRight = playerX < CANVAS_WIDTH / 2;
  const arcX = loopRight ? playerX + 80 : playerX - 80;
  return [
    { x: fromX,     y: fromY + 70 },
    { x: arcX,      y: PLAYER_Y - 150 },
    { x: playerX,   y: PLAYER_Y - 20 },
    { x: loopRight ? playerX - 80 : playerX + 80, y: PLAYER_Y - 150 },
    { x: fromX,     y: fromY },
  ];
}

// Build challenge wave path (sinusoidal left-to-right)
function makeChallengeWavePath(waveIndex) {
  const paths = [
    // Wave 0: left-to-right sine
    Array.from({ length: 20 }, (_, i) => ({
      x: -30 + i * 28,
      y: 200 + Math.sin(i * 0.5) * 80,
    })),
    // Wave 1: right-to-left loop
    Array.from({ length: 20 }, (_, i) => ({
      x: CANVAS_WIDTH + 30 - i * 28,
      y: 180 + Math.sin(i * 0.6) * 100,
    })),
    // Wave 2: spiral from bottom-left
    Array.from({ length: 20 }, (_, i) => ({
      x: 40 + i * 12 + Math.sin(i * 0.8) * 60,
      y: CANVAS_HEIGHT + 20 - i * 30,
    })),
    // Wave 3: spiral from bottom-right
    Array.from({ length: 20 }, (_, i) => ({
      x: CANVAS_WIDTH - 40 - i * 12 - Math.sin(i * 0.8) * 60,
      y: CANVAS_HEIGHT + 20 - i * 30,
    })),
    // Wave 4: figure-8 across center
    Array.from({ length: 20 }, (_, i) => ({
      x: CANVAS_WIDTH / 2 + Math.sin(i * 0.63) * 160,
      y: 150 + Math.sin(i * 1.26) * 80,
    })),
  ];
  return paths[waveIndex % 5];
}

class Enemy {
  constructor(game, col, row, type, side) {
    this.game = game;
    this.type = type;
    this.formationCol = col;
    this.formationRow = row;
    this.alive = true;
    this._damaged = false;
    this.hits = type === TYPE_BOSS ? 2 : 1;
    this.diveSpeed = DIVE_SPEED;
    this.diveReturnSpeed = DIVE_RETURN_SPEED;

    const { x: fx, y: fy } = getFormationXY(col, row);
    this.formationX = fx;
    this.formationY = fy;

    // Size per type
    if (type === TYPE_BOSS) {
      this.width = 10 * BLOCK_SIZE; // 40px
      this.height = 9 * BLOCK_SIZE; // 36px
    } else {
      this.width = 8 * BLOCK_SIZE;  // 32px
      this.height = 7 * BLOCK_SIZE; // 28px
    }

    // Entry and dive paths
    this._entryPath = makeEntryPath(col, row, side);
    this._divePath  = [];
    this._waypointIndex = 0;

    // Tractor beam state (Boss only)
    this._tractorTargetX = 0;
    this._tractorTimer   = 0;
    this._capturedShip   = false; // true if this boss has captured the fighter

    // Position: start at first entry waypoint
    this.x = this._entryPath[0].x;
    this.y = this._entryPath[0].y;

    // Entry stagger delay
    this._entryDelay = 0;
    this._entryDelayLeft = 0;

    // State machine
    this.states = {
      [ENTERING]:  new EnteringState(this),
      [FORMATION]: new FormationState(this),
      [DIVING]:    new DivingState(this),
      [TRACTOR]:   new TractorState(this),
      [RETURNING]: new ReturningState(this),
      [DEAD]:      new DeadState(this),
    };
    this.currentState = this.states[ENTERING];
    this.currentState.enter();
  }

  get state() { return this.currentState.state; }

  enterState(name) {
    if (this.currentState.state === name) return;
    this.currentState = this.states[name];
    this.currentState.enter();
  }

  startDive(playerX) {
    this._divePath = makeDivePath(this.x, this.y, playerX);
    this._waypointIndex = 0;
    this.enterState(DIVING);
  }

  startTractor(playerX) {
    this._tractorTargetX = playerX;
    this._tractorTimer = 0;
    this._waypointIndex = 0;
    this.enterState(TRACTOR);
  }

  // Move toward next waypoint in path; transition to nextState when path complete
  _stepTowardWaypoint(path, speed, nextState) {
    if (!path || path.length === 0) { this.enterState(nextState); return; }
    const idx = this._waypointIndex;
    if (idx >= path.length) {
      if (nextState === FORMATION) {
        this.x = this.formationX;
        this.y = this.formationY;
      }
      this._waypointIndex = 0;
      this.enterState(nextState);
      return;
    }
    const wp = path[idx];
    const dx = wp.x - this.x;
    const dy = wp.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < speed + 1) {
      this.x = wp.x;
      this.y = wp.y;
      this._waypointIndex++;
    } else {
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    }

    // If diving and exited screen bottom, re-enter from top
    if (nextState === RETURNING && this.y > CANVAS_HEIGHT + 40) {
      this.y = -40;
      this._waypointIndex = Math.max(0, path.length - 2);
    }
  }

  hit() {
    this.hits--;
    if (this.hits <= 0) {
      this.enterState(DEAD);
      return true; // killed
    }
    this._damaged = true;
    // Re-enter current state to pick up damaged sprite
    this.currentState.enter();
    return false; // not dead yet
  }

  update(oscillationTick) {
    if (!this.alive) return;
    if (this.state === FORMATION) {
      const osc = Math.sin(oscillationTick * 0.015) * 20;
      this.x = this.formationX + osc;
      this.y = this.formationY;
    }
    this.currentState.nextFrame();
  }

  draw(ctx) {
    if (!this.alive) return;
    const sprite = this.currentState.getImage();
    if (!sprite) return;
    ctx.save();
    drawShape(ctx, BLOCK_SIZE, sprite, Math.floor(this.x - this.width / 2), Math.floor(this.y - this.height / 2));
    ctx.restore();
  }
}

// Build the 36-enemy formation
export function buildFormation(game, staggerDelay = 8) {
  const enemies = [];

  // Layout: [col, row, type, side]
  const layout = [];

  // Boss: row 0, cols 1,2 left / 7,8 right
  layout.push([1, 0, TYPE_BOSS, 'left'],  [2, 0, TYPE_BOSS, 'left']);
  layout.push([7, 0, TYPE_BOSS, 'right'], [8, 0, TYPE_BOSS, 'right']);

  // Goei: rows 1-2, cols 1-3 left / 6-8 right
  for (let row = 1; row <= 2; row++) {
    for (const col of [1, 2, 3]) layout.push([col, row, TYPE_GOEI, 'left']);
    for (const col of [6, 7, 8]) layout.push([col, row, TYPE_GOEI, 'right']);
  }

  // Zakozako: rows 3-4, cols 0-4 left / 5-9 right
  for (let row = 3; row <= 4; row++) {
    for (const col of [0, 1, 2, 3, 4]) layout.push([col, row, TYPE_ZAKOZAKO, 'left']);
    for (const col of [5, 6, 7, 8, 9]) layout.push([col, row, TYPE_ZAKOZAKO, 'right']);
  }

  layout.forEach(([col, row, type, side], i) => {
    const e = new Enemy(game, col, row, type, side);
    e._entryDelay = i * staggerDelay;
    e._entryDelayLeft = e._entryDelay;
    enemies.push(e);
  });

  return enemies;
}

// Build small 24-enemy formation for stage 1: 4 Boss + 8 Goei + 12 Zakozako
export function buildSmallFormation(game, staggerDelay = 8) {
  const layout = [];

  // Boss: row 0, cols 2,3 left + cols 6,7 right = 4
  layout.push([2, 0, TYPE_BOSS, 'left'], [3, 0, TYPE_BOSS, 'left']);
  layout.push([6, 0, TYPE_BOSS, 'right'], [7, 0, TYPE_BOSS, 'right']);

  // Goei: row 1, cols 1-4 left + cols 5-8 right = 8
  for (const col of [1, 2, 3, 4]) layout.push([col, 1, TYPE_GOEI, 'left']);
  for (const col of [5, 6, 7, 8]) layout.push([col, 1, TYPE_GOEI, 'right']);

  // Zakozako: rows 2-3, cols 1,2,3 left + cols 6,7,8 right = 12
  for (let row = 2; row <= 3; row++) {
    for (const col of [1, 2, 3]) layout.push([col, row, TYPE_ZAKOZAKO, 'left']);
    for (const col of [6, 7, 8]) layout.push([col, row, TYPE_ZAKOZAKO, 'right']);
  }

  return layout.map(([col, row, type, side], i) => {
    const e = new Enemy(game, col, row, type, side);
    e._entryDelay = i * staggerDelay;
    e._entryDelayLeft = e._entryDelay;
    return e;
  });
}

// Build boss stage: 10 Boss Galaga enemies in 2 rows
export function buildBossFormation(game, staggerDelay = 12) {
  const layout = [
    // Row 0: 4 bosses
    [2, 0, TYPE_BOSS, 'left'],  [3, 0, TYPE_BOSS, 'left'],
    [6, 0, TYPE_BOSS, 'right'], [7, 0, TYPE_BOSS, 'right'],
    // Row 1: 6 bosses
    [1, 1, TYPE_BOSS, 'left'],  [2, 1, TYPE_BOSS, 'left'],  [3, 1, TYPE_BOSS, 'left'],
    [6, 1, TYPE_BOSS, 'right'], [7, 1, TYPE_BOSS, 'right'], [8, 1, TYPE_BOSS, 'right'],
  ];

  return layout.map(([col, row, type, side], i) => {
    const e = new Enemy(game, col, row, type, side);
    e._entryDelay = i * staggerDelay;
    e._entryDelayLeft = e._entryDelay;
    return e;
  });
}

// Build 8 challenge-wave enemies on a predefined path
export function buildChallengeWave(game, waveIndex) {
  const path = makeChallengeWavePath(waveIndex);
  const enemies = [];
  for (let i = 0; i < 8; i++) {
    const e = new Enemy(game, 0, 3, TYPE_ZAKOZAKO, 'left');
    // Override entry path with challenge wave path
    e._entryPath = path;
    e._waypointIndex = 0;
    e.x = path[0].x;
    e.y = path[0].y;
    e._entryDelay = i * 10;
    e._entryDelayLeft = e._entryDelay;
    enemies.push(e);
  }
  return enemies;
}

export default Enemy;
