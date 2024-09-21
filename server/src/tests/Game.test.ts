import { describe, it, expect } from "vitest";
import { Game } from "../controllers/Game";
import { testDbClient } from "./setup";

const FIRST_FACE_OFF_ROUND = 4;

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

  it("should draw a card if the game is active, it's the player's turn and there's no face off", async () => {
    const game = await createThreePlayerGame();
    expect(game.isActive).toBe(true);
    const firstRoundResults = await game.drawCard(0);
    expect(firstRoundResults.faceOff).toBe(undefined);
    for (let i = 1; i < FIRST_FACE_OFF_ROUND; i++) {
      const playerIndex = i % 3;
      await game.drawCard(playerIndex);
    }
    expect(game.drawCard(FIRST_FACE_OFF_ROUND % 3)).rejects.toThrow("Deal with the face off first!");
  });

  it("should give the claimed card to the winner", async () => {
    const game = await createThreePlayerGame();
    expect(game.isActive).toBe(true);
    for (let i = 0; i < FIRST_FACE_OFF_ROUND - 1; i++) {
      const playerIndex = i % 3;
      await game.drawCard(playerIndex);
    }
    const { faceOff, activeCards } = await game.drawCard((FIRST_FACE_OFF_ROUND - 1) % 3);
    expect(faceOff).toEqual([0, 1]);
    expect(game.handleFaceOff(2)).rejects.toThrow("You don't have a face off with anyone!");
    await game.handleFaceOff(1);
    const claimedCards = game.players[1].ClaimedCard;
    expect(claimedCards).toHaveLength(1);
    const playersWithClaimedCards = game.players.filter(({ ClaimedCard }) => ClaimedCard.length > 0);
    expect(playersWithClaimedCards).toHaveLength(1);
  });
});
