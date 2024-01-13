import "dotenv/config";
import { createServer } from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import { handleJoinGameRequest, handleNewGameRequest } from "socketListeners";
import { CLIENT_REQUESTS } from "anomia-types";
import { db } from "db/dbClient";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN } });

io.use(async (socket: Socket, next) => {
  const playerId: string | undefined = socket.handshake.auth.id;
  if (!playerId) return next(new Error("No 'id' was provided"));
  const gameId = await db.getGameByPlayer(playerId);
  if (gameId && !socket.rooms.has(gameId)) socket.join(gameId);
  next();
});

io.on("connection", (socket: Socket) => {
  console.log("new connection: ", socket.id);
  // socket.on handles requests coming from the client
  // socket.emit goes to THAT socket
  // socket.broadcast.emit goes to OTHER sockets
  // socket.to(room).emit goes to users in a room
  socket.on(CLIENT_REQUESTS.newGame, handleNewGameRequest(socket));
  socket.on(CLIENT_REQUESTS.joinGame, handleJoinGameRequest(socket));
});

server.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`);
});
