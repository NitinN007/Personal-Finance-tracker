const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "User already exists" });
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });
    return res
      .status(201)
      .json({
        message: "Registered ✅",
        user: { id: user._id, name: user.name, email: user.email },
      });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });
    const payload = { id: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "Login ✅",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res.status(401).json({ message: "Refresh token missing" });
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });
    res.json({ accessToken });
  } catch (e) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out ✅" });
};
