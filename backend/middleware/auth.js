const jwt = require("jsonwebtoken");
const user = require("../models/User");

const authMiddleware = async (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization");
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  // Verify token
  try {
    console.log(`token: ${token}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded: ", JSON.stringify(decoded));
    const userRec = await user.findOne({
      username: decoded.username,
      createdAt: decoded.createdAt,
    });

    if (!userRec) {
      throw new Error("User not found");
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
