class Pixel {
  constructor(blockSize, col, row) {
    this.blockSize = blockSize;
    this.col = col;
    this.row = row;
  }

  draw(ctx, color = 'red') {
    const x = this.col * this.blockSize;
    const y = this.row * this.blockSize;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, this.blockSize, this.blockSize);
  }
}

export default Pixel;
