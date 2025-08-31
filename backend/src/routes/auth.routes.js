const express = require("express");
const {
  postRegisterHandler,
  postLoginHandler,
  logout,
} = require("../controllers/auth.controller");
const router = express.Router();

router.post("/register",postRegisterHandler);
router.post("/login",postLoginHandler);
router.get("/logout",logout)

module.exports = router;
