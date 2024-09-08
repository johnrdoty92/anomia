import { describe, it, expect, vi, beforeEach } from "vitest";
import { Game } from "../controllers/Game";
import { testDbClient } from "./setup";

const mocks = vi.hoisted(() => ({ getGameId: vi.fn(() => "ABCDEF") }));

vi.mock("../util/randomId", () => ({ getGameId: mocks.getGameId }));

const createThreePlayerGame = async () => {
  const game = await Game.createGame({
    adminName: "Alice",
    db: testDbClient,
    deckId: "default",
  });
  await game.addPlayer({ name: "Bob" });
  await game.addPlayer({ name: "Charlie" });
  await game.start();
  return game;
};

describe("Game Class Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a game with one player", async () => {
    const game = await Game.createGame({
      adminName: "admin",
      db: testDbClient,
      deckId: "default",
    });
    const player = testDbClient.player.findMany({ where: { gameId: game.id } });
    expect(player).resolves.toHaveLength(1);
  });

  it("should only start a game if there are enough players", async () => {
    const game = await Game.createGame({
      adminName: "admin",
      db: testDbClient,
      deckId: "default",
    });
    expect(game.start()).rejects.toThrow("Must have at least three players to start!");
    await game.addPlayer({ name: "Alice" });
    await game.addPlayer({ name: "Bob" });
    await game.start();
    expect(game.isActive).toBe(true);
  });

  it("should only add players while the game is inactive", async () => {
    const game = await createThreePlayerGame();
    expect(game.addPlayer({ name: "Charlie" })).rejects.toThrow("Cannot join game because it already started.");
  });

  it("should draw a card if the game is active and it's the player's turn", async () => {
    const game = await createThreePlayerGame();
    expect((await game.drawCard(0)).faceOff).toBe(undefined);
  });

  it.skip("should draw a card if there's no faceoff", () => {
    expect(true).toBe(false);
  });

  it.skip("should handle players in order", () => {
    expect(true).toBe(false);
  });
});
