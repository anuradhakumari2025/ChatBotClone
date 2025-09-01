const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "https://chatgptclonefrontend-vbxh.onrender.com",
    credentials: true,
  })
);

// API routes
app.get("/",(req,res)=>{
  res.send("API is running...")
})
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

module.exports = app;
