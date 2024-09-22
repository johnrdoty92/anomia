import { Card, Player, Prisma, PrismaClient } from "@prisma/client";
import { ClientToServerEvents, DeckIds, PlayerSocketData, ServerToClientEvents } from "anomia-shared";
import { Socket } from "socket.io";
import { IoSever } from "../sever";
import { Game } from "./Game";

export class Connection {
  constructor(
    private db: PrismaClient,
    public socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, PlayerSocketData>,
    public ioServer: IoSever,
  ) {}
  setUpListeners() {
    this.handleCreateGame();
    this.handleJoinGame();
  }

  handleCreateGame() {
    this.socket.on("createGame", async (args, cb) => {
      const isActiveSession = !!this.socket.data.gameId;
      if (isActiveSession) return; // TODO: does cb need to be called?
      const deckId = DeckIds.includes(args.deckId) ? args.deckId : DeckIds[0];
      const game = await Game.createGame({ adminName: args.adminName, db: this.db, deckId });
      this.socket.join(game.id);
      this.ioServer.to(game.id).emit("playerJoined", { name: args.adminName });
      cb(game.players[0]);
    });
  }
  handleJoinGame() {
    this.socket.on("joinGame", async ({ gameId, name }, cb) => {
      // TODO: make sure they are not in active session
      // TODO: handle errors
      const game = await Game.loadGame({ db: this.db, gameId });
      const player = await game.addPlayer({ name });
      this.ioServer.to(game.id).emit("playerJoined", { name });
      this.socket.join(game.id);
      cb({ game: { id: game.id, players: game.players.map(({ name }) => ({ name })) }, player });
    });
  }

  // handleTakeTurn() {}
  // handleFaceOff() {}
  // handleGameEnd() {} // remember that this should delete the game, which cascades to all players
}
