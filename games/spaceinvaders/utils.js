export const drawGrid = (ctx, width, height, blockSize) => {
  ctx.save();
  ctx.strokeStyle = 'lightgrey';
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }
  ctx.restore();
};

const colorMap = {
  r: 'red',
  b: 'blue',
  g: 'green',
  d: 'black',
  y: 'yellow',
  p: 'purple',
  w: 'white',
};

export const drawShape = (ctx, blockSize, image, x, y) => {
  ctx.save();
  for (let j = 0; j < image.length; j++) {
    for (let i = 0; i < image[0].length; i++) {
      if (colorMap[image[j][i]]) {
        ctx.fillStyle = colorMap[image[j][i]];
        ctx.fillRect(x + i * blockSize, y + j * blockSize, blockSize, blockSize);
      }
    }
  }
  ctx.restore();
};

export const isCollision = (a, b) => {
  if (a.width && b.width && a.height && b.width) {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }

  return false;
};

export const getRandomNumber = (range) => Math.floor(Math.random() * range);

export const shuffle = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const delay = (timeout) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
