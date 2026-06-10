import { IDLE, WALK_LEFT, WALK_RIGHT, PUNCH, KICK, CROUCH, JUMP, JUMP_PUNCH, JUMP_KICK } from './constants.js';

class InputHandler {
  constructor() {
    this.keys = new Set();
    document.addEventListener('keydown', (e) => {
      e.preventDefault();
      this.keys.add(e.key);
    });
    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });
  }

  update(fighter) {
    const state = fighter.currentState.state;

    // Don't interrupt active attack states
    if (state === PUNCH || state === KICK || state === JUMP_PUNCH || state === JUMP_KICK) return;

    // Fatigued — can't attack
    const fatigued = fighter._fatigued;

    // Action keys — airborne gets jump variants
    if (!fatigued && (this.keys.has('z') || this.keys.has('Z'))) {
      fighter.enterState(fighter.isOnGround ? PUNCH : JUMP_PUNCH);
      return;
    }
    if (!fatigued && (this.keys.has('x') || this.keys.has('X'))) {
      fighter.enterState(fighter.isOnGround ? KICK : JUMP_KICK);
      return;
    }

    // Jump
    if (this.keys.has('ArrowUp') || this.keys.has(' ')) {
      fighter.jump();
      return;
    }

    // Movement (only when on ground or mid-air walk)
    if (this.keys.has('ArrowDown')) {
      if (fighter.isOnGround && state !== JUMP) {
        fighter.enterState(CROUCH);
      }
      return;
    }

    if (this.keys.has('ArrowLeft')) {
      if (state !== JUMP) fighter.enterState(WALK_LEFT);
      return;
    }

    if (this.keys.has('ArrowRight')) {
      if (state !== JUMP) fighter.enterState(WALK_RIGHT);
      return;
    }

    // No keys pressed — go idle (not while jumping)
    if (state !== JUMP && state !== IDLE) {
      fighter.enterState(IDLE);
    }
  }
}

export default InputHandler;
