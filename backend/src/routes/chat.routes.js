const express = require("express");
const { authUser } = require("../middleware/auth.middleware");
const { createChat, getChats, getMessages } = require("../controllers/chat.controller");
const router = express.Router();

router.post("/", authUser, createChat);
router.get("/",authUser,getChats)
router.get("/messages/:id",authUser,getMessages)
module.exports = router;
