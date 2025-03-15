const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkRole = require("./middleware/roleCheck");
const User = require("../models/User");


router.get("/dashboard", [auth, checkRole(["admin"])], (req, res) => {
  res.json({ msg: "Admin dashboard data" });
});


router.get("/users", [auth, checkRole(["admin"])], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
