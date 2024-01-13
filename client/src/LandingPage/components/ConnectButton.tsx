import { ChangeEventHandler, MouseEventHandler, useState } from "react";
import { useSockets } from "../../shared/hooks/useSockets";

const JoinExistingGame = ({ playerName }: { playerName: string }) => {
  const { joinGame } = useSockets();
  const [gameId, setGameId] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => setGameId(target.value);

  const handleClick = () => {
    const playerId = localStorage.getItem("anomia-player-id");
    if (!gameId || !playerId || !playerName) return;
    joinGame(gameId, { playerId, playerName });
  };
  return (
    <>
      <input value={gameId} onChange={handleChange} />
      <button disabled={!gameId || !playerName} onClick={handleClick}>
        Join Existing Game
      </button>
    </>
  );
};

const CreateNewGameButton = ({ playerName }: { playerName: string }) => {
  const { createNewGame } = useSockets();

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    const playerId = localStorage.getItem("anomia-player-id");
    if (!playerId || !playerName) return;
    createNewGame({ playerId, playerName });
  };

  return (
    <button disabled={!playerName} onClick={handleClick}>
      Start new game
    </button>
  );
};

export const ConnectButton = () => {
  const { currentGame } = useSockets();
  const [playerName, setPlayerName] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => setPlayerName(target.value);

  return (
    <>
      <input value={playerName} onChange={handleChange} placeholder="Name" />
      <CreateNewGameButton playerName={playerName} />
      <JoinExistingGame playerName={playerName} />
      {currentGame ? <p>Current Game: {currentGame}</p> : null}
    </>
  );
};
