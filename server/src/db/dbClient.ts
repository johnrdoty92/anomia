import { PrismaClient } from "@prisma/client";

class DbClient {
  private static db: PrismaClient;
  constructor() {
    if (!DbClient.db) {
      DbClient.db = new PrismaClient();
    }
  }
  // TODO: define types for player/game creation
  async createGame({
    playerName,
    playerId,
  }: {
    playerName: string;
    playerId: string;
  }): Promise<{ gameId: string; playerId: string }> {
    const { id } = await DbClient.db.game.create({
      data: {
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
  async addPlayer(gameId: string, { name, id }: { name: string; id: string }) {
    const player = await DbClient.db.player.create({ data: { name, id, Game: { connect: { id: gameId } } } });
    return player;
  }
  // deleteGame (throws if not exists)
  // getPlayer
}

const db = new DbClient();

export { db };
