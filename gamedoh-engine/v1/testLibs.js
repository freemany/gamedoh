const _console = window.console;

window.console = {
  ..._console,
  assert: (...arg) => {
    console.log(`${arg[0] ? '✅ Passed' : '❌ Failed'}: ${arg[1]} 🎯`);
  },
};

const deepEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
};

export { deepEqual };

export const test = (cases, assertFunc) => {
  for (const c of cases) {
    console.assert(assertFunc(c.data, c.expected), c.msg);
  }
};
