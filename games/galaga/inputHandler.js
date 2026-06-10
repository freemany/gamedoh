import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', ' ']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    // Only non-movement keys go to framework (handles pause/start/restart)
    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    game._keys = game._keys || {};
    game._keys[e.key] = true;

    if (game.state === GAME_STATE.PLAYING && game.fighter) {
      if (e.key === ' ') game.fighter.shoot();
    }
  });

  document.body.addEventListener('keyup', (e) => {
    game._keys = game._keys || {};
    game._keys[e.key] = false;
    if (game.state === GAME_STATE.PLAYING && game.fighter) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Only stop if neither direction key is held
        if (!game._keys['ArrowLeft'] && !game._keys['ArrowRight']) {
          game.fighter.stopMoving();
        }
      }
    }
  });
};

export default inputHandler;
