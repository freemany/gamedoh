class Button {
  constructor({ x, y, game, text }) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.text = text;
    this.width = 60;
    this.height = 20;
  }

  setText(text) {
    this.text = text;
  }

  draw(ctx) {
    ctx.save();
    // Background
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x - this.width, this.y - this.height, this.width, this.height);
    // Text
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x - this.width / 2, this.y - this.height / 2);
    ctx.restore();
  }

  isClicked(clickX, clickY) {
    return (
      clickX >= this.x - this.width &&
      clickX <= this.x &&
      clickY >= this.y - this.height &&
      clickY <= this.y
    );
  }
}

export default Button;
