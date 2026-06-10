import { BaseGame } from './gamedoh-engine.js';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE, HEART_BEAT,
  LIVES, INITIAL_SPEED, MAX_SPEED, SPEED_UP_EVERY,
  SIDEBAR_X, BOARD_Y,
  DROP_FRAMES_START, DROP_FRAMES_MIN, SPEED_UP_LINES,
  SCORE_1, SCORE_2, SCORE_3, SCORE_4, SOFT_DROP_SCORE, HARD_DROP_SCORE,
} from './constants.js';
import { PIECE_TYPES } from './pieces.js';
import Piece from './piece.js';
import { playSound } from './sounds.js';
import {
  drawStartScreen, drawPauseOverlay, drawGameOverScreen, drawWinScreen,
} from './screens.js';

const overAudio = document.getElementById('overAudio');

class Game extends BaseGame {
  constructor(ctx, opts) {
    super(ctx, opts, {
      canvasWidth:  CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      blockSize:    BLOCK_SIZE,
      heartbeat:    HEART_BEAT,
      lives:        LIVES,
      initialSpeed: INITIAL_SPEED,
      maxSpeed:     MAX_SPEED,
      speedUpEvery: SPEED_UP_EVERY,
    });
    this.level         = null;  // Tetris manages speed via linesCleared, no timer
    this.board         = null;
    this.piece         = null;
    this.nextType      = null;
    this.linesCleared  = 0;
    this._dropTimer    = 0;
    this._dropInterval = DROP_FRAMES_START;
    this._gameOver     = false;
  }

  get levelNumber() {
    return Math.floor(this.linesCleared / SPEED_UP_LINES) + 1;
  }

  // ── Public player-action methods (called from inputHandler) ──────────────

  moveLeft() {
    if (this.board.isValid(this.piece.shape, this.piece.x - 1, this.piece.y))
      this.piece.x--;
  }

  moveRight() {
    if (this.board.isValid(this.piece.shape, this.piece.x + 1, this.piece.y))
      this.piece.x++;
  }

  softDrop() {
    if (this.board.isValid(this.piece.shape, this.piece.x, this.piece.y + 1)) {
      this.piece.y++;
      this.addScore(SOFT_DROP_SCORE);
      this._dropTimer = 0;
    } else {
      this._lockPiece();
    }
  }

  hardDrop() {
    let dropped = 0;
    while (this.board.isValid(this.piece.shape, this.piece.x, this.piece.y + 1)) {
      this.piece.y++;
      dropped++;
    }
    this.addScore(dropped * HARD_DROP_SCORE);
    this._lockPiece();
  }

  rotatePiece() {
    const nextRot   = (this.piece.rotation + 1) % this.piece.rotations.length;
    const nextShape = this.piece.rotations[nextRot];
    // Wall kick: try centre position then nudge left/right
    for (const kick of [0, -1, 1, -2, 2]) {
      if (this.board.isValid(nextShape, this.piece.x + kick, this.piece.y)) {
        this.piece.x        += kick;
        this.piece.rotation  = nextRot;
        playSound('rotate');
        return;
      }
    }
  }

  // ── Spawning ─────────────────────────────────────────────────────────────

  _randomType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  spawnPiece() {
    const type    = this.nextType || this._randomType();
    this.nextType = this._randomType();
    const piece   = new Piece(type);
    if (!this.board.isValid(piece.shape, piece.x, piece.y)) {
      this._gameOver = true;
    }
    return piece;
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  _lockPiece() {
    this.board.lock(this.piece.shape, this.piece.x, this.piece.y, this.piece.color);

    const lines = this.board.clearLines();
    if (lines > 0) {
      this.linesCleared += lines;
      this._updateDropSpeed();
      const scoreMap = [0, SCORE_1, SCORE_2, SCORE_3, SCORE_4];
      this.addScore(scoreMap[Math.min(lines, 4)]);
      playSound(lines >= 4 ? 'tetris' : 'clear');
      if (lines >= 4 && this.shake) this.shake.trigger(); // Tetris! — screen shake
    } else {
      playSound('drop');
    }

    this._dropTimer = 0;
    this.piece = this.spawnPiece();
  }

  _updateDropSpeed() {
    const level = Math.floor(this.linesCleared / SPEED_UP_LINES);
    this._dropInterval = Math.max(DROP_FRAMES_MIN, DROP_FRAMES_START - level * 4);
  }

  _ghostY() {
    let gy = this.piece.y;
    while (this.board.isValid(this.piece.shape, this.piece.x, gy + 1)) gy++;
    return gy;
  }

  // ── BaseGame overrides ───────────────────────────────────────────────────

  _update() {
    if (this._gameOver) {
      this._gameOver = false;
      this.lives = 1; // so super.loseLife() takes lives to 0 → game over screen
      this.loseLife();
      return;
    }

    this._dropTimer++;
    if (this._dropTimer >= this._dropInterval) {
      this._dropTimer = 0;
      if (this.board.isValid(this.piece.shape, this.piece.x, this.piece.y + 1)) {
        this.piece.y++;
      } else {
        this._lockPiece();
      }
    }
  }

  _drawWorld() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    this.board.draw(ctx);

    // Ghost piece (landing preview)
    const gy = this._ghostY();
    if (gy !== this.piece.y) this.piece.drawGhost(ctx, gy);

    this.piece.draw(ctx);
    this._drawSidebar(ctx);
  }

  _drawSidebar(ctx) {
    const sx = SIDEBAR_X;
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';

    // SCORE
    ctx.fillStyle = '#888';
    ctx.font      = 'bold 13px monospace';
    ctx.fillText('SCORE', sx, BOARD_Y);
    ctx.fillStyle = '#fff';
    ctx.font      = 'bold 18px monospace';
    ctx.fillText(String(this.score).padStart(7, '0'), sx, BOARD_Y + 18);

    // NEXT piece preview
    ctx.fillStyle = '#888';
    ctx.font      = 'bold 13px monospace';
    ctx.fillText('NEXT', sx, BOARD_Y + 70);
    if (this.nextType) new Piece(this.nextType).drawPreview(ctx, sx, BOARD_Y + 90);

    // LEVEL
    ctx.fillStyle = '#888';
    ctx.font      = 'bold 13px monospace';
    ctx.fillText('LEVEL', sx, BOARD_Y + 200);
    ctx.fillStyle = '#00e5ff';
    ctx.font      = 'bold 26px monospace';
    ctx.fillText(this.levelNumber, sx, BOARD_Y + 218);

    // LINES
    ctx.fillStyle = '#888';
    ctx.font      = 'bold 13px monospace';
    ctx.fillText('LINES', sx, BOARD_Y + 270);
    ctx.fillStyle = '#fff';
    ctx.font      = 'bold 26px monospace';
    ctx.fillText(this.linesCleared, sx, BOARD_Y + 288);

    // Pause hint
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '12px monospace';
    ctx.fillText('[P] pause', sx, CANVAS_HEIGHT - 30);

    ctx.restore();
  }

  drawHUD() {} // HUD is drawn inside _drawSidebar

  loseLife() {
    if (overAudio) { overAudio.currentTime = 0; overAudio.play().catch(() => {}); }
    super.loseLife();
  }

  drawStartScreen()    { drawStartScreen(this.ctx, this.startButton); }
  drawPauseOverlay()   { drawPauseOverlay(this.ctx); }
  drawGameOverScreen() { drawGameOverScreen(this.ctx, this.score, this.restartButton); }
  drawWinScreen()      { drawWinScreen(this.ctx, this.score, this.restartButton); }
}

export default Game;
