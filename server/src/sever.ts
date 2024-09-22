import { ClientToServerEvents, ServerToClientEvents, PlayerSocketData } from "anomia-shared";
import { Server } from "socket.io";

export const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, PlayerSocketData>();

export type IoSever = typeof io;

export type Middleware = Parameters<(typeof io)["use"]>[0];
