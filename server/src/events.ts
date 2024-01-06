export const SERVER_EVENTS = {
  createNewGame: "createNewGame",
  startGame: "startGame",
  joinGame: "joinGame",
} as const;

export const CLIENT_EVENTS = {
  newGameCode: "newGameCode",
} as const;
