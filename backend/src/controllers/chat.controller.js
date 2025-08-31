const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

module.exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const user = req.user;
    const newChat = await Chat.create({
      title,
      user: user._id,
    });
    return res.status(200).json({
      message: "Chat created",
      newChat
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getChats = async (req, res) => {
  try {
    const user = req.user;
    const chats = await Chat.find({ user: user._id });
    return res.json({ chats });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ chat: id });
    return res
      .status(200)
      .json({ message: "Messages retrieved successfully", messages });
  } catch (error) {
    return res.json({ message: "Some error", error });
  }
};
