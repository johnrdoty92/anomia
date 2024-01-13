import { CreatePlayerArgs, SERVER_EMITTED_EVENTS } from "anomia-types";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_URL, { autoConnect: false });

type Sockets = {
  isConnected: boolean;
  currentGame: string;
  players: string[];
  createNewGame: (playerData: CreatePlayerArgs) => void;
  joinGame: (gameId: string, playerData: CreatePlayerArgs) => void;
};

export const SocketsContext = createContext<Sockets | null>(null);

export const SocketsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentGame, setCurrentGame] = useState("");
  const [players, setPlayers] = useState<string[]>([]);

  const createNewGame: Sockets["createNewGame"] = (playerData) => {
    socket.emit("newGame", playerData);
  };

  const joinGame: Sockets["joinGame"] = (gameId, playerData) => {
    socket.emit("joinGame", gameId, playerData);
  };

  useEffect(() => {
    const onConnect = () => {
      console.log("connected");
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("disconnected");
      setIsConnected(false);
    };
    const onNewPlayer = ({ playerName }: CreatePlayerArgs) => {
      setPlayers((prev) => (prev.includes(playerName) ? prev : [...prev, playerName]));
    };
    const onGameId = (gameId: string) => {
      setCurrentGame(gameId);
    };
    const onError = (err: unknown) => {
      console.error("Connection error", err);
    };
    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
    socket.on("disconnect", onDisconnect);
    socket.on(SERVER_EMITTED_EVENTS.newPlayer, onNewPlayer);
    socket.on(SERVER_EMITTED_EVENTS.gameId, onGameId);
    if (!socket.connected) {
      let id = localStorage.getItem("anomia-player-id");
      if (!id) {
        id = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
        localStorage.setItem("anomia-player-id", id);
      }
      socket.auth = { id };
      socket.connect();
    }
    return () => {
      socket.offAny();
    };
  }, []);
  return (
    <SocketsContext.Provider value={{ players, joinGame, isConnected, createNewGame, currentGame }}>
      {children}
    </SocketsContext.Provider>
  );
};
