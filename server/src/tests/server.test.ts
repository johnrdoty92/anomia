import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as clientIo, Socket } from "socket.io-client";
import { Server } from "socket.io";
import { SEED, testDbClient } from "./dbMock";
import { auth } from "../middleware/auth";
import { Game } from "../controllers/Game";
import { IoSever } from "../sever";
import { Connection } from "../controllers/Connection";
import {
  ClientToServerEvents,
  GamePayload,
  GameStatePayload,
  PlayerPayload,
  ServerToClientEvents,
} from "anomia-shared";

type SocketApp = {
  server: IoSever;
  connectionUrl: string;
};

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

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

const GAME_ID = "GHIJKL";

const mocks = vi.hoisted(() => ({ getGameId: vi.fn(() => GAME_ID), getDeckSeed: vi.fn(() => SEED) }));

vi.mock("../util/random", () => ({ ...mocks }));

describe("socket server", () => {
  beforeEach<{ app: SocketApp }>(async (context) => {
    const app = await createSocketApp();
    context.app = app;
  });

  afterEach<{ app: SocketApp }>(async (context) => {
    const { app } = context;
    app.server.close();
    app.server.disconnectSockets();
    await testDbClient.game.delete({ where: { id: GAME_ID } });
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
    const clientSocket: ClientSocket = clientIo(app.connectionUrl);
    const player = await new Promise<PlayerPayload>((resolve, reject) => {
      clientSocket.emit("createGame", { adminName: "Alice", deckId: "default" }, (player) => {
        player.success ? resolve(player.data) : reject(player);
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
    const clientSocket: ClientSocket = clientIo(app.connectionUrl);
    const joinedGame = await new Promise<{ game: GamePayload; player: PlayerPayload }>((resolve, reject) => {
      clientSocket.emit("joinGame", { name: "Bob", gameId: game.id }, (response) => {
        response.success ? resolve(response.data) : reject(response.message);
      });
    });
    expect(joinedGame?.player.name).toBe("Bob");
    expect(testDbClient.player.findUnique({ where: { id: joinedGame?.player.id } })).resolves.toBeDefined();
  });

  it<{ app: SocketApp }>("should handle taking a turn", async ({ app }) => {
    const game = await Game.createGame({
      adminName: "Alice",
      db: testDbClient,
      deckId: "default",
    });
    const { server } = app;
    server.use(auth(testDbClient));
    server.on("connection", (socket) => {
      const connection = new Connection(testDbClient, socket, server);
      connection.handleCreateGame();
      connection.handleStartGame();
      connection.handleTakeTurn();
    });
    const clientSocket: ClientSocket = clientIo(app.connectionUrl, {
      autoConnect: false,
    });
    clientSocket.auth = { playerId: game.players[0].id };
    clientSocket.connect();
    const result: { message?: string } = await new Promise((resolve) => {
      clientSocket.emit("startGame", (response) => {
        resolve(response);
      });
    });
    expect(result.message).toBe("Must have at least three players to start!");
    await game.addPlayer({ name: "Bob" });
    await game.addPlayer({ name: "Charlie" });
    const startedGame = await new Promise<GameStatePayload | undefined>((resolve) => {
      clientSocket.emit("startGame", (response) => {
        resolve(response.data);
      });
    });
    expect(startedGame?.activeCards).toBeDefined();
    expect(startedGame?.faceOff).toBe(null);
  });
});
