import { ClientToServerEvents, ServerToClientEvents, SocketData } from "anomia-shared";
import { Server } from "socket.io";

const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>();

io.on("connection", (socket) => {
  // TODO: create functions for each handler
});

io.listen(parseInt(process.env.PORT));
