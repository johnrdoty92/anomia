import { db } from "db/dbClient";
import { CreatePlayerArgs, SERVER_EMITTED_EVENTS } from "anomia-types";
import { Socket } from "socket.io";

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
