import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as clientIo, Socket as ClientSocket } from "socket.io-client";
import { Server } from "socket.io";
import { testDbClient } from "./setup";
import { auth } from "../middleware/auth";
import { Game } from "../controllers/Game";
import { IoSever } from "../sever";
import { Connection } from "../controllers/Connection";
import { ClientToServerEvents, Player, ServerToClientEvents } from "anomia-shared";

type SocketApp = {
  server: IoSever;
  connectionUrl: string;
};

const createSocketApp = () => {
  return new Promise<SocketApp>((resolve) => {
    const httpServer = createServer();
    const server = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      const connectionUrl = `http://localhost:${port}`;
      resolve({ server, connectionUrl });
    });
  });
};

describe("socket server", () => {
  beforeEach<{ app: SocketApp }>(async (context) => {
    const app = await createSocketApp();
    context.app = app;
  });

  afterEach<{ app: SocketApp }>((context) => {
    const { app } = context;
    app.server.close();
    app.server.disconnectSockets();
  });

  it<{ app: SocketApp }>("should check for player id on auth", async ({ app }) => {
    const { server } = app;
    const { players } = await Game.createGame({
      adminName: "Alice",
      db: testDbClient,
      deckId: "default",
    });
    const { gameId, id, index, name } = players[0];
    return new Promise<void>((resolve) => {
      server.use(auth(testDbClient));
      server.on("connection", (socket) => {
        expect(socket.data).toEqual({ gameId, id, index, name });
        resolve();
      });
      const clientSocket = clientIo(app.connectionUrl, { autoConnect: false });
      clientSocket.auth = { playerId: id };
      clientSocket.connect();
    });
  });

  it<{ app: SocketApp }>("should handle request to create a game", async ({ app }) => {
    const { server } = app;
    server.on("connection", (socket) => {
      const connection = new Connection(testDbClient, socket, server);
      connection.handleCreateGame();
    });
    const clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents> = clientIo(app.connectionUrl);
    const player = await new Promise<Player>((resolve) => {
      clientSocket.emit("createGame", { adminName: "Alice", deckId: "default" }, (player) => {
        resolve(player);
      });
    });
    const dbPlayer = await testDbClient.player.findUnique({ where: { id: player.id } });
    expect(dbPlayer).toBeDefined();
  });

  it<{ app: SocketApp }>("should handle request to join game", async ({ app }) => {
    const game = await Game.createGame({
      adminName: "Alice",
      db: testDbClient,
      deckId: "default",
    });
    const { server } = app;
    server.on("connection", (socket) => {
      const connection = new Connection(testDbClient, socket, server);
      connection.handleJoinGame();
    });
    const clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents> = clientIo(app.connectionUrl);
    return await new Promise<void>((resolve) => {
      clientSocket.emit("joinGame", { name: "Bob", gameId: game.id }, (joinedGame) => {
        expect(joinedGame.player.name).toBe("Bob");
        expect(testDbClient.player.findUnique({ where: { id: joinedGame.player.id } })).resolves.toBeDefined();
        resolve();
      });
    });
  });
});
