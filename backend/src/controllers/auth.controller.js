const User = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.postRegisterHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isUserExists = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (isUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true for HTTPS
      sameSite: "none", // "none" for cross-site cookies
      domain: ".onrender.com", // optional, for subdomains
    });
    res.status(200).json({ message: "User Registered Successfully", newUser });
    // res.redirect("/auth/login");
  } catch (error) {
    console.log(error);
  }
};

module.exports.postLoginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true for HTTPS
      sameSite: "none", // "none" for cross-site cookies
      domain: ".onrender.com", // optional, for subdomains
    });
    // res.redirect("/");
    return res.status(200).json({ message: "Login Successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.log("error");
  }
};
