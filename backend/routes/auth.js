const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
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
      let token;

      if (!user) {
        

        const createdAt = new Date(); // Set createdAt once

        const payload = { username, createdAt };
        token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });

        user = await User.create({
          username,
          role,
          password: password,
          token,
          createdAt, // Store it in DB permanently
        });
      } else {
       

        // Generate new token with existing createdAt
        const payload = { username, createdAt: user.createdAt };
        token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });

        // Update user with new token
        await User.findOneAndUpdate(
          { username },
          { $set: { token } },
          { new: true }
        );
      }

      res.json({ username, role: user.role, token, createdAt: user.createdAt });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
