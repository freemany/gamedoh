import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  const keys = {};

  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    // Only forward non-movement keys to the framework (start/pause/restart)
    // so arrow keys on the game over screen don't accidentally restart
    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    keys[e.key] = true;

    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowLeft')  game.mario.move('left');
      if (e.key === 'ArrowRight') game.mario.move('right');
      if (e.key === 'ArrowUp' || e.key === ' ') game.mario.move('jump');
    }
  });

  document.body.addEventListener('keyup', (e) => {
    keys[e.key] = false;

    // Stop horizontal movement when key released
    if (game.state === GAME_STATE.PLAYING) {
      if ((e.key === 'ArrowLeft' && !keys['ArrowRight']) ||
          (e.key === 'ArrowRight' && !keys['ArrowLeft'])) {
        game.mario.move('stop');
      }
    }
  });
};

export default inputHandler;
