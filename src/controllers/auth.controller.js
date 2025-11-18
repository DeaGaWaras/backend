const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, kelas } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const user = new User({
      name,
      email,
      password,
      role: role || "siswi",
      kelas,
    });
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kelas: user.kelas,
      },
    });
  } catch (err) {
    console.error("[auth.register]", err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kelas: user.kelas,
      },
    });
  } catch (err) {
    console.error("[auth.login]", err);
    next(err);
  }
};

exports.profile = async (req, res) => {
  // req.user di-set oleh auth.middleware
  res.json({ user: req.user });
};
