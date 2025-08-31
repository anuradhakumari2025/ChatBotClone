require("dotenv").config();
const http = require("http");
const path = require("path");
const express = require("express");
const app = require("./src/app");
const { initSocketServer } = require("./src/socket/socket.server");
const connectionToDB = require("./src/db/db");

// Serve frontend dist folder as static
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const httpServer = http.createServer(app);
initSocketServer(httpServer);

connectionToDB()

httpServer.listen(4000, () => {
  console.log("Server is running on port 4000");
});
