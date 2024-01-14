import { PrismaClient } from "@prisma/client";
import { CreatePlayerArgs } from "anomia-types";
import { generateGameSessionId } from "util/random";

class DbClient {
  private static db: PrismaClient;
  constructor() {
    if (!DbClient.db) {
      DbClient.db = new PrismaClient();
    }
  }
  async createGame({ playerName, playerId }: CreatePlayerArgs): Promise<{ gameId: string; playerId: string }> {
    const { id } = await DbClient.db.game.create({
      data: {
        id: generateGameSessionId(),
        players: {
          create: { name: playerName, id: playerId },
        },
      },
    });
    const player = await DbClient.db.player.findFirst({ where: { gameId: id } });
    if (!player) throw new Error("Failed to find player for new game");
    return { gameId: id, playerId: player.id };
  }
  async getGameByPlayer(playerId: string): Promise<string | undefined> {
    const game = await DbClient.db.game.findFirst({
      where: { players: { some: { id: playerId } } },
      select: { id: true },
    });
    return game?.id;
  }
  async addPlayer(gameId: string, playerData: CreatePlayerArgs) {
    const { playerId, playerName } = playerData;
    try {
      const player = await DbClient.db.player.create({
        data: { name: playerName, id: playerId, Game: { connect: { id: gameId } } },
      });
      return player;
    } catch (error) {
      console.error(error);
      return new Error(`Cannot join game ${gameId}. Does not exist.`);
    }
  }
  // TODO:
  // update player's cards
  // get player's cards (for syncing if disconnected)
  // delete game
  // update current player?
  async clearData() {
    if (process.env.NODE_ENV !== "development") return;
    const deletePlayers = DbClient.db.player.deleteMany();
    const deleteGames = DbClient.db.game.deleteMany();
    await DbClient.db.$transaction([deletePlayers, deleteGames]);
  }
}

const db = new DbClient();

export { db };
