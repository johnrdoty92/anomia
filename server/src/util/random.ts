const ALPHABET_RANGE = 26;
const ASCII_OFFSET = 65;

export const getGameId = () =>
  Array(6)
    .fill("")
    .map(() =>
      String.fromCharCode(
        Math.floor(Math.random() * ALPHABET_RANGE) + ASCII_OFFSET,
      ),
    )
    .join("");

export const getDeckSeed = () => Math.floor(Math.random() * 10000);