import { useSockets } from "../../shared/hooks/useSockets";

export const ConnectButton = () => {
  const { createNewGame, currentGame } = useSockets();
  return (
    <>
      <button onClick={createNewGame}>Start new game</button>
      {currentGame ? <p>Current Game: {currentGame}</p> : null}
    </>
  );
};
