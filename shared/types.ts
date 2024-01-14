export type EventsMap = {
    gameId: (gameId: string) => void;
    newPlayer: (playerData: CreatePlayerArgs) => void;
    // TODO: add args
    nextTurn: () => void;
    faceOff: () => void;
    gameStart: () => void;
    gameEnd: () => void;
};

export type CreatePlayerArgs = {
    playerName: string;
    playerId: string;
}