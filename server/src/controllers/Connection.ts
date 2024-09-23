import { PrismaClient } from "@prisma/client";
import { ClientToServerEvents, DeckIds, PlayerPayload, PlayerSocketData, ServerToClientEvents } from "anomia-shared";
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
    this.handleStartGame();
    this.handleJoinGame();
    this.handleTakeTurn();
    this.handleFaceOff();
    // this.handleGameEnd();
  }

  handleCreateGame() {
    this.socket.on("createGame", async (args, cb) => {
      if (this.#isActiveGame) return cb({ success: false, message: "Cannot create new game while another is active." });
      const deckId = DeckIds.includes(args.deckId) ? args.deckId : DeckIds[0];
      const game = await Game.createGame({ adminName: args.adminName, db: this.db, deckId });
      const player = game.players[0];
      const playerPayload = { gameId: game.id, id: player.id, name: player.name, index: player.index };
      this.socket.data = playerPayload;
      this.socket.join(game.id);
      this.ioServer.to(game.id).emit("playerJoined", { name: args.adminName, id: player.id });
      cb({ success: true, data: playerPayload });
    });
  }

  handleJoinGame() {
    this.socket.on("joinGame", async (args, cb) => {
      if (this.#isActiveGame) return cb({ success: false, message: "You have already joined a game!" });
      try {
        const game = await Game.loadGame({ db: this.db, gameId: args.gameId });
        const { gameId, id, index, name } = await game.addPlayer({ name: args.name });
        const playerPayload: PlayerPayload = { gameId, id, index, name };
        this.socket.data = playerPayload;
        this.socket.join(gameId);
        this.ioServer.to(gameId).emit("playerJoined", { name, id });
        cb({
          success: true,
          data: {
            game: { id: game.id, players: game.players },
            player: playerPayload,
          },
        });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something went wrong when trying to join a game";
        cb({ success: false, message });
      }
    });
  }

  handleStartGame() {
    this.socket.on("startGame", async (cb) => {
      if (!this.#isActiveGame) return cb({ success: false, message: "You must join a game before starting one" });
      try {
        const game = await Game.loadGame({ db: this.db, gameId: this.socket.data.gameId });
        const turnStatus = await game.start();
        this.ioServer.to(game.id).emit("gameStatus", turnStatus);
        cb({ success: true, data: turnStatus });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something went wrong when trying to start a game";
        cb({ success: false, message });
      }
    });
  }

  handleTakeTurn() {
    this.socket.on("takeTurn", async (cb) => {
      if (!this.#isActiveGame) return cb({ success: false, message: "Please join or create a game first" });
      try {
        const game = await Game.loadGame({ db: this.db, gameId: this.socket.data.gameId });
        const turnStatus = await game.drawCard(this.socket.data.index);
        cb({ success: true, data: turnStatus });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something when wrong when trying to take your turn";
        cb({ success: false, message });
      }
    });
  }

  handleFaceOff() {
    this.socket.on("claimCard", async (cb) => {
      if (!this.#isActiveGame) return cb({ success: false, message: "Please join or create a game first" });
      try {
        const game = await Game.loadGame({ db: this.db, gameId: this.socket.data.gameId });
        const turnStatus = await game.handleFaceOff(this.socket.data.index);
        cb({ success: true, data: turnStatus });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something when wrong when trying handle the face off";
        cb({ success: false, message });
      }
    });
  }

  // handleGameEnd() {} // remember that this should delete the game, which cascades to all players. It should also clear socket data so they can join/create  a new game

  get #isActiveGame() {
    return !!this.socket.data?.gameId;
  }
}
