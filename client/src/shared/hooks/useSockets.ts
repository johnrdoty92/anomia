import { useContext } from "react";
import { SocketsContext } from "../contexts/sockets.context";

export const useSockets = () => {
  const sockets = useContext(SocketsContext);
  if (!sockets) throw "Must call useSockets within provider";
  return sockets;
};
