export const drawGrid = (ctx, width, height, blockSize) => {
  ctx.strokeStyle = "lightgrey";
  for (let y=0; y<height-1; y++) {
    for (let x=0; x<width; x++) {
      ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }
};

const colorMap = { r: "red", b: "blue", g: "green", d: "black", y: "yellow", o: "orange", p: "purple" };

export const drawShape = (ctx, blockSize, image, x, y) => {
  for(let j=0; j<image.length; j++) {
    for(let i=0; i<image[0].length; i++) {
      if (colorMap[image[j][i]]) {
        ctx.fillStyle = colorMap[image[j][i]];
        ctx.fillRect(x + i * blockSize, y + j * blockSize, blockSize, blockSize);
      }
    }
  }
};

export const isCollision = (a, b) => {
  if (a.width && b.width && a.height && b.width) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  return false;
};

export const getRandom = (n) => Math.floor(Math.random() * n);
