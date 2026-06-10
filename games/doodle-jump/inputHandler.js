import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  const keys = {};
  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    // Only non-movement keys reach the framework (pause/start/restart)
    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    keys[e.key] = true;

    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowLeft')  game.player.move('left');
      if (e.key === 'ArrowRight') game.player.move('right');
    }
  });

  document.body.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (game.state === GAME_STATE.PLAYING) {
      if (
        (e.key === 'ArrowLeft'  && !keys['ArrowRight']) ||
        (e.key === 'ArrowRight' && !keys['ArrowLeft'])
      ) {
        game.player.move('stop');
      }
    }
  });
};

export default inputHandler;
