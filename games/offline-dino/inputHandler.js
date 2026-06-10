import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  document.body.addEventListener('keydown', (e) => {
    // Don't block browser shortcuts
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    game.handleKey(e.key);

    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowUp' || e.key === ' ') game.tRex.move('jump');
      if (e.key === 'ArrowDown') game.tRex.move('duck');
    }
  });

  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown' && game.tRex) game.tRex.move('release_duck');
    if ((e.key === 'ArrowUp' || e.key === ' ') && game.tRex) game.tRex.move('release_jump');
  });
};

export default inputHandler;
