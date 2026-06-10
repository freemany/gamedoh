const directions = {
  ArrowLeft: 'left',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ' ': 'space',
};

const inputHandler = (moveCallback) => {
  document.addEventListener('keydown', (e) => {
    e.preventDefault();
    const command = directions[e.key];
    if (command) {
      moveCallback(command);
    }
  });
};

export default inputHandler;
