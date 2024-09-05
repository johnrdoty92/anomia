-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "currentCardIndex" INTEGER NOT NULL,
    "deckShuffleSeed" INTEGER NOT NULL,
    "deckId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClaimedCard" (
    "id" TEXT NOT NULL,
    "cardIndex" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "ClaimedCard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "shape1" TEXT NOT NULL,
    "shape2" TEXT,
    "deckId" TEXT NOT NULL,
    "topic" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_id_key" ON "Player"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_gameId_index_key" ON "Player"("gameId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimedCard_id_key" ON "ClaimedCard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Card_id_key" ON "Card"("id");
