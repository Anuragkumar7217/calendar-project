const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/login",
  [
    check("username", "Username is required").exists(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    try {
      let user = await User.findOne({ username });

      if (!user) {
        // Hash password before storing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdAt = new Date(); // Set createdAt once

        const payload = { username, createdAt };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });

        user = await User.create({
          username,
          role,
          password: hashedPassword,
          token,
          createdAt, // Store it in DB permanently
        });
      } else {
        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Keep createdAt from the database constant
        const payload = { username, createdAt: user.createdAt };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });

        user.token = token;
        await user.save();
      }

      res.json({ username, role, token, createdAt: user.createdAt });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
