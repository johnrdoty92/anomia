import { EventsMap } from "./types";

type ServerEmittedEvents = {[Key in keyof EventsMap]: Key}

export const SERVER_EMITTED_EVENTS: ServerEmittedEvents = {
  newPlayer: "newPlayer",
  gameId: "gameId",
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
