export const DeckIds = ["default"] as const 

export type DeckId = typeof DeckIds[number] 

export type Response<T> = (
  response: { success: true, data: T, message?: never } | { success: false, data?: never, message: string }
) => void

export type PlayerPayload = {
  gameId: string
  id: string
  index: number
  name: string
}

export type GameStatePayload = {
  faceOff: [number, number] | null
  activeCards: {
    player: PlayerPayload,
    card: {
      index: number
      id: string;
      shape1: number;
      shape2: number | null;
      deckId: string;
      topic: string;
    }
  }
}

export type GamePayload = {
  id: string
  players: { name: string, id: string }[]
}


export type ServerToClientEvents = {
  gameStarted: (gameState: GameStatePayload) => void;
  playerJoined: ({ name, id }: { name: string, id: string }) => void;
  gameStatus: (gameState: GameStatePayload) => void;
  gameOver: (winner: string) => void;
};

export type ClientToServerEvents = {
  createGame: ({ adminName, deckId }: { adminName: string; deckId: DeckId }, response: Response<PlayerPayload>) => void;
  joinGame: ({ name, gameId }: { name: string; gameId: string }, response: Response<{game: GamePayload, player: PlayerPayload}>) => void;
  startGame: (gameId: string, response: Response<GameStatePayload>) => void
  takeTurn: ({ playerIndex, gameId }: { playerIndex: number; gameId: string }, response: Response<GameStatePayload>) => void;
  claimCard: ({ playerIndex }: { playerIndex: number }, response: Response<GameStatePayload>) => void;
  restartGame: ({ gameId }: { gameId: string }, response: Response<GamePayload>) => void;
  endGame: ({ gameId }: { gameId: string }, reponse: Response<GameStatePayload>) => void;
};

export type PlayerSocketData = Partial<{
  id: string;
  gameId: string;
  name: string;
  index: number;
}>;
