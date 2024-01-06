import { Game } from "./gameState";

export class GameStore {
  private static instance: GameStore;
  private store: Map<string, Game>;

  constructor() {
    if (!GameStore.instance) {
      GameStore.instance = this;
    }
    this.store = new Map();
    return GameStore.instance;
  }
  addGame(game: Game) {
    if (this.store.has(game.sessionId)) throw new Error(`Game ${game.sessionId} already exists`);
    this.store.set(game.sessionId, game);
  }
}
