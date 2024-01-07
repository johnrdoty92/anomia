export const SERVER_EMITTED_EVENTS = {
  newPlayer: "newPlayer",
  nextTurn: "nextTurn",
  faceOff: "faceOff",
  gameStart: "gameStart",
  gameEnd: "gameEnd",
} as const;

export const CLIENT_REQUESTS = {
  newGame: "newGame",
  startGame: "startGame",
  joinGame: "joinGame",
  playerMove: "playerMove",
  playerClaimCard: "playerClaimCard",
} as const;
