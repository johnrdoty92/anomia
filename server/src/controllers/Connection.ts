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
    this.handleGameEnd();
    // this.handleGameRestart();
  }

  handleCreateGame() {
    this.socket.on("createGame", async (args, cb) => {
      try {
        this.assertInactiveGame("Cannot create new game while another is active.");
        const deckId = DeckIds.includes(args.deckId) ? args.deckId : DeckIds[0];
        const game = await Game.createGame({ adminName: args.adminName, db: this.db, deckId });
        const player = game.players[0];
        const playerPayload = { gameId: game.id, id: player.id, name: player.name, index: player.index };
        this.socket.data = playerPayload;
        this.socket.join(game.id);
        this.ioServer.to(game.id).emit("playerJoined", { name: args.adminName, id: player.id });
        cb({ success: true, data: playerPayload });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something went wrong when trying to create a game";
        cb({ success: false, message });
      }
    });
  }

  handleJoinGame() {
    this.socket.on("joinGame", async (args, cb) => {
      try {
        this.assertInactiveGame("You have already joined a game!");
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
      try {
        this.assertActiveGame();
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
      try {
        this.assertActiveGame();
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
      try {
        this.assertActiveGame();
        const game = await Game.loadGame({ db: this.db, gameId: this.socket.data.gameId });
        const turnStatus = await game.handleFaceOff(this.socket.data.index);
        cb({ success: true, data: turnStatus });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something went wrong when trying handle the face off";
        cb({ success: false, message });
      }
    });
  }

  handleGameRestart() {}

  handleGameEnd() {
    this.socket.on("endGame", async (cb) => {
      try {
        this.assertActiveGame();
        const game = await Game.loadGame({ db: this.db, gameId: this.socket.data.gameId });
        const isAdmin = game.players[0].id === this.socket.data.id;
        if (!isAdmin) throw new Error("Only the game creator can end a game.");
        const { results } = await game.end();
        cb({ success: true, data: results });
        this.ioServer.to(game.id).disconnectSockets();
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Something went wrong when trying to end the game.";
        cb({ success: false, message });
      }
    });
  }

  assertActiveGame() {
    if (!this.socket.data?.gameId) throw new Error("Please join or create a game first!");
  }

  assertInactiveGame(errorMessage: string) {
    if (!!this.socket.data?.gameId) throw new Error(errorMessage);
  }
}
