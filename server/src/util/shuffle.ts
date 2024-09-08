// Taken from https://stackoverflow.com/a/47593316
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>({ items, seed }: { items: T[]; seed: number }) {
  const random = mulberry32(seed);
  const cardsCopy = structuredClone(items);
  for (let i = cardsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * i);
    const temp = cardsCopy[i];
    cardsCopy[i] = cardsCopy[j];
    cardsCopy[j] = temp;
  }
  return cardsCopy;
}
