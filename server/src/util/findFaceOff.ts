import { Card } from "@prisma/client";

export function findFaceOff<T extends { card: Card | null }>(items: T[]): [T, T] | null {
  const hashmap = new Map<number, T>();
  for (const item of items) {
    if (!item.card) continue;
    const existingEntry = hashmap.get(item.card.shape1);
    if (existingEntry != null) return [existingEntry, item];
    // TODO: handle wild cards
    hashmap.set(item.card.shape1, item);
  }
  return null;
}
