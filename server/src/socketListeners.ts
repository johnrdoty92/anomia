import { db } from "db/dbClient";
import { SERVER_EMITTED_EVENTS } from "./events";
import { Socket } from "socket.io";

export const handleNewGameRequest =
  (socket: Socket) =>
  // TODO: use the db types defined to keep consistency
  async ({ playerName, playerId }: { playerName: string; playerId: string }) => {
    console.log("new game with: ", playerName);
    // TODO: add constraint to prevent creating a game if already in one
    const { gameId } = await db.createGame({ playerName, playerId });
    socket.join(gameId);
    // TODO: add event to let client know they've joined the room
    socket.broadcast.to(gameId).emit(SERVER_EMITTED_EVENTS.newPlayer, { playerName, playerId });
  };

export const handleJoinGameRequest =
  (socket: Socket) => async (gameId: string, playerData: { id: string; name: string }) => {
    const playerId: string | undefined = socket.handshake.auth.id;
    if (!playerId) return new Error("Missing 'id'. Cannot join game.");
    const { id, name } = await db.addPlayer(gameId, playerData);
    socket.join(gameId);
    socket.broadcast.to(gameId).emit(SERVER_EMITTED_EVENTS.newPlayer, { playerName: name, playerId: id });
  };
