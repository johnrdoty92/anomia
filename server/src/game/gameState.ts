import { generateGameSessionId } from "util/random";

interface GameMechanics {
  addPlayer(): void;
  taketurn(): void;
  endGame(): void;
  checkForMatches(): void;
}

export class Game implements GameMechanics {
  public readonly manager: string;
  public readonly sessionId: string;
  // private players
  constructor(manager: string) {
    this.manager = manager;
    this.sessionId = generateGameSessionId();
  }
  addPlayer(): void {}
  checkForMatches(): void {}
  endGame(): void {}
  taketurn(): void {}
}
