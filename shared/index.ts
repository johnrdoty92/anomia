export type DeckId = "default";

export type ServerToClientEvents = {
  gameStarted: () => void;
  gameCreated: (gameId: string) => void;
  playerJoined: ({ name }: { name: string }) => void;
  gameStatus: (gameStatus: unknown) => void;
  gameOver: () => void;
};

export type ClientToServerEvents = {
  createGame: ({ adminName, deckId }: { adminName: string; deckId: DeckId }) => void;
  joinGame: ({ name, gameId }: { name: string; gameId: string }) => void;
  takeTurn: ({ playerIndex, gameId }: { playerIndex: number; gameId: string }) => void;
  claimCard: ({ playerIndex }: { playerIndex: number }) => void;
  restartGame: ({ gameId }: { gameId: string }) => void;
  endGame: ({ gameId }: { gameId: string }) => void;
};

export type SocketData = {
  name: string;
  index: number;
};
