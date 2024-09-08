import { describe, expect, it } from "vitest";
import { findFaceOff } from "../util/findFaceOff";
import { Card } from "@prisma/client";

describe("findFaceOff", () => {
  it("should return null if there's no face off", () => {
    const activeCards: { card: Card }[] = Array(8)
      .fill(null)
      .map((_, i) => ({ card: { deckId: "default", id: "", shape1: i, shape2: null, topic: "" } }));
    expect(findFaceOff(activeCards)).toBe(null);
  });
  it("should return a face off", () => {
    const activeCards: { card: Card }[] = [
      { card: { deckId: "default", id: "", shape1: 0, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 2, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
    ];
    const faceOff = findFaceOff(activeCards);
    expect(faceOff).toHaveLength(2);
    expect(faceOff).toEqual([
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
    ]);
  });
  it("should return a single face off even if there are more than one", () => {
    const activeCards: { card: Card }[] = [
      { card: { deckId: "default", id: "", shape1: 0, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
    ];
    const faceOff = findFaceOff(activeCards);
    expect(faceOff).toHaveLength(2);
    expect(faceOff).toEqual([
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
      { card: { deckId: "default", id: "", shape1: 1, shape2: null, topic: "" } },
    ]);
  });
});
