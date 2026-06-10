const directions = {
  ArrowLeft: 'l',
  ArrowUp: 'u',
  ArrowRight: 'r',
  ArrowDown: 'd',
  ' ': 'shoot',
};

const inputHandler = (moveCallback, shootCallback) => {
  document.body.addEventListener('keydown', (e) => {
    e.preventDefault();
    const command = directions[e.key];
    if (command === 'shoot' && shootCallback) {
      shootCallback();
    }
    if (command) {
      moveCallback(command);
    }
  });
};

export default inputHandler;
