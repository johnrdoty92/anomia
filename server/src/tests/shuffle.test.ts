import { describe, expect, it } from "vitest";
import { shuffle } from "../util/shuffle";

describe("shuffle", () => {
  it("should match the snapshot", () => {
    const length = 100;
    const shuffled = shuffle({
      items: Array(length)
        .fill(0)
        .map((_, i) => i),
      seed: 1,
    });
    expect(shuffled).toMatchSnapshot();
    expect(shuffled).toHaveLength(length);
    expect(new Set(shuffled).size).toBe(length);
  });
});
