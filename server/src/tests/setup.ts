import { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach, vi } from "vitest";

export const testDbClient = new PrismaClient();

const SEED = 1000;

const mocks = vi.hoisted(() => ({ getGameId: vi.fn(() => "ABCDEF"), getDeckSeed: vi.fn(() => SEED) }));

vi.mock("../util/random", () => ({ ...mocks }));

const resetDb = async () => {
  await testDbClient.$transaction([testDbClient.game.deleteMany()]);
};

beforeEach(async () => {
  vi.restoreAllMocks();
});

afterEach(async () => {
  await resetDb();
});
