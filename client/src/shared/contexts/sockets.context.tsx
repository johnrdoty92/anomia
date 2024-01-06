import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_URL, { autoConnect: false });

type Sockets = {
  isConnected: boolean;
  currentGame: string;
  createNewGame: () => void;
};

export const SocketsContext = createContext<Sockets | null>(null);

export const SocketsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentGame, setCurrentGame] = useState("");
  // then define functions that handle emitting certain events
  // create a store to keep track of player state
  const createNewGame = () => {
    socket.emit("createNewGame");
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
    const onJoinedGame = (gameSessionCode: string) => {
      setCurrentGame(gameSessionCode);
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("newGameCode", onJoinedGame);
    if (!socket.connected) {
      socket.auth = { username: "developer" };
      socket.connect();
    }
    return () => {
      socket.offAny();
    };
  });
  return (
    <SocketsContext.Provider value={{ isConnected, createNewGame, currentGame }}>{children}</SocketsContext.Provider>
  );
};
