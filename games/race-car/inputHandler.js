import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    game.handleKey(e.key);

    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowLeft') game.playerCar.move('left');
      if (e.key === 'ArrowRight') game.playerCar.move('right');
    }
  });
};

export default inputHandler;
