import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  // Tracked held-key state (read by player.update() each frame)
  game._keys = {};

  // Keys that drive movement — must NOT be forwarded to game.handleKey()
  // (doing so would accidentally restart the game from the game-over screen)
  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'x', 'X']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    // Framework handles pause (P), start (Enter), restart (Enter on game-over)
    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    game._keys[e.key] = true;

    if (game.state === GAME_STATE.PLAYING && !game._transitioning) {
      // Space: place bomb (discrete — fires once per keydown)
      if (e.key === ' ') game.player?.placeBomb();

      // X: detonate remote bomb(s)
      if (e.key === 'x' || e.key === 'X') game.player?.detonateRemote();
    }
  });

  document.body.addEventListener('keyup', (e) => {
    game._keys[e.key] = false;
  });
};

export default inputHandler;
