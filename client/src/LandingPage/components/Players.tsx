import { useSockets } from "../../shared/hooks/useSockets";

export const Players = () => {
  const { players } = useSockets();
  return (
    <section>
      <h2>Players:</h2>
      {players.map((player) => (
        <p key={player}>{player}</p>
      ))}
    </section>
  );
};
