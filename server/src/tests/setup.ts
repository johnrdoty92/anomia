import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";

export const testDbClient = new PrismaClient();

const resetDb = async () => {
  await testDbClient.$transaction([testDbClient.game.deleteMany()]);
};

beforeEach(async () => {
  await resetDb();
});
