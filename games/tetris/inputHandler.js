import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  // Movement keys must NOT be forwarded to game.handleKey() —
  // arrow keys would accidentally restart the game from the game-over screen.
  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    if (game.state !== GAME_STATE.PLAYING) return;

    if (e.key === 'ArrowLeft')  { game.moveLeft();   return; }
    if (e.key === 'ArrowRight') { game.moveRight();  return; }
    if (e.key === 'ArrowUp')    { game.rotatePiece(); return; }
    if (e.key === 'ArrowDown')  { game.softDrop();   return; }
    if (e.key === ' ' && !e.repeat) { game.hardDrop(); return; }
  });
};

export default inputHandler;
