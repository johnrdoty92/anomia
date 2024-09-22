import { Connection } from "./controllers/Connection";
import { dbClient } from "./db";
import { auth } from "./middleware/auth";
import { io } from "./sever";

io.use(auth(dbClient));

io.on("connection", (socket) => {
  const connection = new Connection(dbClient, socket, io);
  connection.setUpListeners();
});

io.listen(parseInt(process.env.PORT));
