import { GAME_STATE } from './gamedoh-engine.js';

const inputHandler = (game) => {
  const keys = {};
  const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'z', 'Z']);

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();

    if (!movementKeys.has(e.key)) game.handleKey(e.key);

    keys[e.key] = true;

    if (game.state === GAME_STATE.PLAYING) {
      if (e.key === 'ArrowLeft')          game.player.move('left');
      if (e.key === 'ArrowRight')         game.player.move('right');
      if (e.key === 'ArrowUp')            game.player.move('aimUp');
      if (e.key === ' ')                  game.player.move('jump');
      if (e.key === 'ArrowDown')          game.player.move('squat');
      if (e.key === 'z' || e.key === 'Z') {
        if (game.player.currentState.state === 'SHOOT_UP') game.player.shootUp(game.bullets);
        else                                                game.player.shoot(game.bullets);
      }
    }
  });

  document.body.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (game.state === GAME_STATE.PLAYING) {
      if ((e.key === 'ArrowLeft'  && !keys['ArrowRight']) ||
          (e.key === 'ArrowRight' && !keys['ArrowLeft'])) {
        game.player.move('stop');
      }
      if (e.key === 'ArrowUp')   game.player.move('stopAimUp');
      if (e.key === 'ArrowDown') game.player.move('unsquat');
    }
  });
};

export default inputHandler;
