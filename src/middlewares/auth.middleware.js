const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authentication token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (verifyError) {
      console.error("[auth.middleware] JWT verify error:", verifyError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // If token id looks like a 24-char hex string (legacy ObjectId), reject
    // the token because the current User._id is numeric. This avoids a
    // Mongoose CastError when querying by _id as Number.
    if (
      typeof decoded.id === "string" &&
      /^[a-fA-F0-9]{24}$/.test(decoded.id)
    ) {
      console.error(
        "[auth.middleware] Legacy ObjectId token detected, rejecting token."
      );
      return res
        .status(401)
        .json({ message: "Stale token: please login again" });
    }

    // Attempt to query user while handling numeric IDs
    let user = null;
    try {
      let idToQuery = decoded.id;
      // If token id looks like an integer, convert to Number for the schema
      if (typeof decoded.id === "string" && /^\d+$/.test(decoded.id)) {
        idToQuery = Number(decoded.id);
      }

      user = await User.findById(idToQuery).select("-password");
    } catch (findErr) {
      console.error(
        "[auth.middleware] User lookup error:",
        findErr.message || findErr
      );
      return res
        .status(401)
        .json({ message: "Invalid token user id, please login again" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[auth.middleware] Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authMiddleware;
