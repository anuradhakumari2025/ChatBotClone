const { Server } = require("socket.io");
const { generateText, generateVector } = require("../services/ai.service");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");
const Message = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "https://chatgptclonefrontend-vbxh.onrender.com",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    if (!cookies.token) {
      next(new Error("Authentication error "));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error "));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("ai-message", async (msgPayload) => {
      //save user's msg in db
      const message = await Message.create({
        chat: msgPayload.chat,
        user: socket.user._id,
        content: msgPayload.content,
        role: "user",
      });

      //convert msg in vector
      const vectors = await generateVector(msgPayload.content);

      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        filter: { user: socket.user._id.toString() }, // use filter instead of metadata
      });

      //save vector in memory(pinecone db)
      await createMemory({
        vectors,
        messageId: message._id.toString(),
        metadata: {
          chat: msgPayload.chat.toString(),
          user: socket.user._id.toString(),
          text: msgPayload.content,
        },
      });

      //extract chatHistory for short term memory(stm)
      const chatHistory = (
        await Message.find({ chat: msgPayload.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      //Long term memory
      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `these are some previous messages chat,use them to generate a response
             ${memory.map((item) => item.metadata.text).join("\n")}`,
            },
          ],
        },
      ];
      //ai generate response based on stm
      const response = await generateText([...ltm, ...stm]);

      //Save ai resonse in db
      const responseMsg = await Message.create({
        chat: msgPayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      //convert response of ai in vector
      const responseVectors = await generateVector(response);

      //save vector in db
      await createMemory({
        vectors: responseVectors,
        messageId: responseMsg._id.toString(),
        metadata: {
          chat: msgPayload.chat.toString(),
          user: socket.user._id.toString(),
          text: response,
        },
      });

      socket.emit("ai-reply", {
        content: response,
        chat: msgPayload.chat,
        role:"model"
      });
    });
  });
}

module.exports = { initSocketServer };

//vectors are array of numbers
