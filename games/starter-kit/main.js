import Game from './game.js';
import Tia from './tia/index.js';
import { ScoreBoard } from './gamedoh-engine.js';
import inputHandler from './inputHandler.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');

const game = new Game(ctx, { canvas });

const setupGame = () => {
  game.tia = new Tia(game);
  game.scoreBoard = new ScoreBoard(game);
};

const resetResources = () => {
  game.tia = new Tia(game);
};

setupGame();
game.onRestart = setupGame;
game.onLevelSetup = resetResources;

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
