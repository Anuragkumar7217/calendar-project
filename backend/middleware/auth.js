const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Handle Bearer token format

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const userRec = await User.findOne({
      username: decoded.username,
      createdAt: decoded.createdAt, // Ensure the same createdAt is used
    });

    if (!userRec) {
      throw new Error("User not found");
    }

    req.user = userRec; // Attach user to request
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token is not valid or expired" });
  }
};

module.exports = authMiddleware;

