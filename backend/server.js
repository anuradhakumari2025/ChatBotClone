require("dotenv").config();
const http = require("http");
const path = require("path");
const express = require("express");
const app = require("./src/app");
const { initSocketServer } = require("./src/socket/socket.server");
const connectionToDB = require("./src/db/db");

// ✅ Serve frontend build (dist copied into public)
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// ✅ React Router fallback
// app.get("*", (req, res) => {
//   res.sendFile(path.join(publicPath, "index.html"));
// });

const httpServer = http.createServer(app);
initSocketServer(httpServer);

// ✅ Connect DB
connectionToDB();

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
