import Game from './game.js';
import PlayerCar from './playerCar.js';
import OpponentCar from './opponentCar.js';
import BossCar from './bossCar.js';
import Road from './road.js';
import { ScoreBoard } from './gamedoh-engine.js';
import inputHandler from './inputHandler.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, OPPONENT_COUNT, OPPONENT_SPACING } from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const setupGame = () => {
  game.playerCar = new PlayerCar(game);
  game.opponents = Array.from(
    { length: OPPONENT_COUNT },
    (_, i) => new OpponentCar(game, i % 3, i % 3, i * OPPONENT_SPACING)
  );
  game.boss = null;
  game.road = new Road(game);
  game.scoreBoard = new ScoreBoard(game);
};

const resetOpponents = () => {
  game.opponents = Array.from(
    { length: OPPONENT_COUNT },
    (_, i) => new OpponentCar(game, i % 3, i % 3, i * OPPONENT_SPACING)
  );
  game.boss = game.level.number === 2 ? new BossCar(game) : null;
};

setupGame();
game.onRestart = setupGame;
game.onLevelSetup = resetOpponents;

inputHandler(game);

const loadAssets = () =>
  new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });

(async () => {
  await loadAssets();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  game.init();
})();
