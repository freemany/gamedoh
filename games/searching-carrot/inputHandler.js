const movementKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

const inputHandler = (game) => {
  game._keys = {};

  document.body.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (!movementKeys.has(e.key)) game.handleKey(e.key);
    game._keys[e.key] = true;
  });

  document.body.addEventListener('keyup', (e) => {
    game._keys[e.key] = false;
  });
};

export default inputHandler;
