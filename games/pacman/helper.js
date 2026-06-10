import { isCollision, getRandom } from './utils.js';
import Block from './block.js';

export const ghostEyes = {
  // 1st row
  '10-10': { x: [1], y: [1] },
  '30-10': { x: [1, -1], y: [1] },
  '50-10': { x: [1, -1], y: [1] },
  '70-10': { x: [1, -1], y: [1] },
  '90-10': { x: [1, -1], y: [1] },
  '110-10': { x: [-1], y: [1] },
  // 2nd row
  '10-30': { x: [1], y: [1, -1] },
  '30-30': { x: [1, -1], y: [1, -1] },
  '50-30': { x: [1, -1], y: [1, -1] },
  '70-30': { x: [1, -1], y: [1, -1] },
  '90-30': { x: [1, -1], y: [1, -1] },
  '110-30': { x: [-1], y: [1, -1] },
  // 3rd row
  '10-50': { x: [1], y: [1, -1] },
  '30-50': { x: [1, -1], y: [1, -1] },
  '50-50': { x: [1, -1], y: [1, -1] },
  '70-50': { x: [1, -1], y: [1, -1] },
  '90-50': { x: [1, -1], y: [1, -1] },
  '110-50': { x: [-1], y: [1, -1] },
  // last row
  '10-70': { x: [1], y: [-1] },
  '30-70': { x: [1, -1], y: [-1] },
  '50-70': { x: [1, -1], y: [-1] },
  '70-70': { x: [1, -1], y: [-1] },
  '90-70': { x: [1, -1], y: [-1] },
  '110-70': { x: [-1], y: [-1] },
};

export const checkHitBlocks = (blocks, pacman) => {
  return blocks.some((block) => isCollision(block, pacman));
};

export const buildMaze = (game) => {
  const blocks = [];
  for (let i = 0; i < 13; i++) {
    const block = new Block(game, { x: 10 * i, y: 0 });
    blocks.push(block);
    const block1 = new Block(game, { x: 10 * i, y: 80 });
    blocks.push(block1);
  }
  for (let i = 1; i <= 7; i++) {
    const block = new Block(game, { x: 0, y: i * 10 });
    blocks.push(block);
    const block1 = new Block(game, { x: 120, y: i * 10 });
    blocks.push(block1);
  }
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 3; i++) {
      const block = new Block(game, { x: 20 + 20 * j, y: 20 + 20 * i });
      blocks.push(block);
    }
  }
  return blocks;
};

export const toRandomColor = (arr, oColor = 'i', nColor = ['l', 'p']) => {
  const rand = getRandom(3);
  return rand === 2
    ? arr
    : JSON.parse(JSON.stringify(arr).replace(new RegExp(oColor, 'g'), nColor[rand]));
};

export const fruitMap = [
  [10, 10],
  [20, 10],
  [30, 10],
  [40, 10],
  [50, 10],
  [60, 10],
  [70, 10],
  [80, 10],
  [90, 10],
  [100, 10],
  [110, 10],
  [10, 20],
  [30, 20],
  [50, 20],
  [70, 20],
  [90, 20],
  [110, 20],
  [10, 30],
  [20, 30],
  [30, 30],
  [40, 30],
  [50, 30],
  [60, 30],
  [70, 30],
  [80, 30],
  [90, 30],
  [100, 30],
  [110, 30],
  [10, 40],
  [30, 40],
  [50, 40],
  [70, 40],
  [90, 40],
  [110, 40],
  [10, 50],
  [20, 50],
  [30, 30],
  [40, 50],
  [50, 50],
  [60, 50],
  [70, 50],
  [80, 50],
  [90, 50],
  [100, 50],
  [110, 50],
  [10, 60],
  [30, 40],
  [50, 60],
  [70, 60],
  [90, 60],
  [110, 60],
  [10, 70],
  [20, 70],
  [30, 30],
  [40, 70],
  [50, 70],
  [60, 70],
  [70, 70],
  [80, 50],
  [90, 70],
  [100, 70],
  [110, 70],
];
