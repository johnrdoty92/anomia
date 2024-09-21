import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as clientIo } from "socket.io-client";
import { Server } from "socket.io";
import { testDbClient } from "./setup";
import { auth } from "../middleware/auth";
import { Game } from "../controllers/Game";

type SocketApp = {
  server: Server;
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
});
