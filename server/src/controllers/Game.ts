import { Card, Player, Prisma, PrismaClient } from "@prisma/client";
import { getGameId } from "../util/randomId";
import { shuffle } from "../util/shuffle";
import { findFaceOff } from "../util/findFaceOff";

type GameCreateArgs = {
  db: PrismaClient;
  adminName: string;
  deckId: string;
};

export class Game {
  static async createGame({ adminName, db, deckId = "default" }: GameCreateArgs) {
    const gameId = getGameId();
    const cards = await db.card.findMany({ where: { deckId } });
    const seed = Math.floor(Math.random() * 10000);
    const deck = shuffle({ items: cards, seed });
    const { players, currentCardIndex, id } = await db.game.create({
      data: {
        id: gameId,
        currentCardIndex: -1,
        deckShuffleSeed: seed,
        players: { create: [{ index: 0, name: adminName }] },
        deckId,
      },
      include: {
        players: {
          include: { ClaimedCard: true },
        },
      },
    });
    return new Game(id, players, deck, currentCardIndex, db);
  }

  static async loadGame({ db, gameId }: { db: PrismaClient; gameId: string }): Promise<Game> {
    try {
      const game = await db.game.findFirst({
        where: { id: gameId },
        include: { players: { include: { ClaimedCard: true } } },
      });
      if (!game) throw new Error(`Game ${gameId} could not be found`);
      const { id, players, deckShuffleSeed, currentCardIndex, deckId } = game;
      const cards = await db.card.findMany({ where: { deckId } });
      const deck = shuffle({ items: cards, seed: deckShuffleSeed });
      return new Game(id, players, deck, currentCardIndex, db);
    } catch (error) {
      console.error(error);
      throw new Error(`Game ${gameId} could not be found`);
    }
  }

  constructor(
    public id: string,
    private players: Prisma.PlayerGetPayload<{ include: { ClaimedCard: true } }>[],
    public deck: Card[],
    public currentCardIndex: number,
    private db: PrismaClient,
  ) {}

  async addPlayer({ name }: { name: string }) {
    if (this.isActive) throw new Error("Cannot join game because it already started.");
    const player = await this.db.player.create({
      data: { index: this.players.length + 1, name, gameId: this.id },
      include: { ClaimedCard: true },
    });
    this.players.push(player);
    return player;
  }

  async start() {
    if (this.players.length < 3) throw new Error("Must have at least three players to start!");
    if (this.isActive) throw new Error("Game has already started!");
    const updatedGame = await this.db.game.update({
      data: { currentCardIndex: 0 },
      where: { id: this.id },
      include: { players: true },
    });
    this.currentCardIndex = updatedGame.currentCardIndex;
    return updatedGame;
  }

  async drawCard(playerIndex: number) {
    if (!this.isActive) throw new Error("Must start game first!");
    const isPlayerTurn = this.currentCardIndex % this.players.length === playerIndex;
    if (!isPlayerTurn) throw new Error("Not your turn!");
    const { faceOff } = this.#turnStatus;
    if (faceOff) throw new Error("Deal with the face off first!");
    const updatedGame = await this.db.game.update({
      data: { currentCardIndex: this.currentCardIndex + 1 },
      where: { id: this.id },
    });
    this.currentCardIndex = updatedGame.currentCardIndex;
    return this.#turnStatus;
  }

  async handleFaceOff() {}

  get #turnStatus(): { faceOff: [number, number] | null; activeCards: { player: Player; card: Card | null }[] } {
    const claimedCards = new Set(
      this.players.map(({ ClaimedCard }) => ClaimedCard.map(({ cardIndex }) => cardIndex)).flat(),
    );
    const currentPlayerIndex = this.currentCardIndex % this.players.length;
    const activeCards = this.players.map((player) => {
      const offset = currentPlayerIndex - player.index;
      let playerCardIndex = this.currentCardIndex - currentPlayerIndex + offset;
      while (playerCardIndex >= 0) {
        if (!claimedCards.has(playerCardIndex)) return { player, card: this.deck[playerCardIndex] };
        playerCardIndex -= this.players.length;
      }
      return { player, card: null };
    });
    const faceOff = findFaceOff(activeCards)?.map(({ player }) => player.index) as [number, number] | null;
    return { faceOff, activeCards };
  }
  async reset() {}

  get isActive() {
    return this.currentCardIndex > -1;
  }
}
