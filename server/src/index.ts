import "dotenv/config";
import { createServer } from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import { CLIENT_EVENTS, SERVER_EVENTS } from "./events";
import { generateGameSessionId, generateRandomId } from "util/random";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN } });

const games: Map<string, { manager: string }> = new Map();

io.use((socket: Socket, next) => {
  const userId: string | undefined = socket.handshake.auth.userId;
  if (userId) {
    // TODO: use the id to get the sessionId, userId, and username from storage
    next();
  }
  const username: string | undefined = socket.handshake.auth.username;
  if (!username) return next(new Error("Missing username"));
  socket.handshake.auth.userId = generateRandomId();
  socket.handshake.auth.sessionId = generateRandomId();
  socket.handshake.auth.username = username;
  next();
});

io.on("connection", (socket: Socket) => {
  console.log("new connection: ", socket.handshake.auth.username);

  socket.on(SERVER_EVENTS.createNewGame, () => {
    const newGame = generateGameSessionId();
    const manager = socket.handshake.auth.userId;
    //

    socket.join(newGame);
    socket.emit(CLIENT_EVENTS.newGameCode, newGame);
  });

  socket.on(SERVER_EVENTS.joinGame, (gameCode) => {
    // check if this room exists
    // check if user is already in a game
    socket.join(gameCode);
    // add socket to the cached game
    // emit to all in this room that a new user has joined
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`);
});
