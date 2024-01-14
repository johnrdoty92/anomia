import { db } from "db/dbClient";
import { CreatePlayerArgs, EventsMap, SERVER_EMITTED_EVENTS } from "anomia-types";
import { Socket as _Socket } from "socket.io";

type Socket = _Socket<EventsMap>;

export const handleNewGameRequest = (socket: Socket) => async (playerData: CreatePlayerArgs) => {
  console.log("new game with: ", playerData.playerName);
  const { playerName, playerId } = playerData;
  const { gameId } = await db.createGame({ playerName, playerId });
  socket.join(gameId);
  socket.emit(SERVER_EMITTED_EVENTS.gameId, gameId);
  socket.broadcast.to(gameId).emit(SERVER_EMITTED_EVENTS.newPlayer, { playerName, playerId });
};

export const handleJoinGameRequest = (socket: Socket) => async (gameId: string, playerData: CreatePlayerArgs) => {
  const playerId: string | undefined = socket.handshake.auth.id;
  if (!playerId) return new Error("Missing 'id'. Cannot join game.");
  const addPlayerResult = await db.addPlayer(gameId, playerData);
  if (addPlayerResult instanceof Error) return addPlayerResult;
  const { name, id } = addPlayerResult;
  socket.join(gameId);
  socket.emit(SERVER_EMITTED_EVENTS.gameId, gameId);
  socket.broadcast.to(gameId).emit(SERVER_EMITTED_EVENTS.newPlayer, { playerName: name, playerId: id });
};

export const handleStartGameRequest = (socket: Socket) => async () => {
  // use socket's auth id to find the game it's associated with
  // if none, return no associated game error
  // if there's enough members, update the state to "inProgress" and return current player's turn
  // else return not enough players error
};
export const handleTakeTurnRequest = (socket: Socket) => async () => {
  // use socket's auth id to make sure it's their turn AND there are no current faceoffs, else return error
  // update player's cards
  // if there's a faceoff, emit faceoff event
  // else update current player
}

export const handleFaceoffResultsRequest = (socket: Socket) => async () => {
  // use socket's auth id to make sure they are in a faceoff, else return error
  // pop the player's opponent's card stack
  // emit a faceoff event if needed
  // update current player
}

export const handleEndGameRequest = (socket: Socket) => async () => {
  // TODO:
}

export const handleLeaveGameRequest = (socket: Socket) => async () => {
  // TODO:
}
