require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const { initSocketServer } = require("./src/socket/socket.server");
const connectionToDB = require("./src/db/db");

const httpServer = http.createServer(app);
initSocketServer(httpServer);

connectionToDB()

httpServer.listen(4000, () => {
  console.log("Server is running on port 4000");
});
