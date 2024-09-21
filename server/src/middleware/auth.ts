import { PrismaClient } from "@prisma/client";
import { Middleware } from "../sever";

export const auth =
  (dbClient: PrismaClient): Middleware =>
  async (socket, next) => {
    const playerId: unknown = socket.handshake.auth.playerId;
    if (playerId && typeof playerId === "string") {
      try {
        const result = await dbClient.player.findUniqueOrThrow({ where: { id: playerId } });
        socket.data = result;
        next();
      } catch (error) {
        console.error(error);
        next(new Error("Player session expired. Please create a new game or join an existing one."));
      }
    } else {
      next();
    }
  };
