const express = require("express");
const jwt = require("jsonwebtoken");
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
        // Create JWT payload
        const currentDate = new Date();
        const payload = { username, password, createdAt: currentDate };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });
        const userResponse = {
          password: password,
          username: username,
          role: role,
          token: token,
          createdAt: currentDate,
        };
        user = await User.insertOne(userResponse, {
          upsert: true,
          new: true,
        });
      } else {
        const isMatch = jwt.verify(password, process.env.JWT_SECRET);
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid credentials" });
        }
        const currentDate = new Date();
        const payload = { username, password, createdAt: currentDate };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5h",
        });
        const userResponse = {
          password: password,
          username: username,
          role: role,
          token: token,
          createdAt: currentDate,
        };
        user = await User.updateOne(userResponse, {
          upsert: true,
          new: true,
        });
      }
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
// router.post(
//   "/register",
//   [
//     check("username", "Username is required").not().isEmpty(),
//     check(
//       "password",
//       "Please enter a password with 6 or more characters"
//     ).isLength({ min: 6 }),
//     check("role", "Role must be either user or admin").isIn(["user", "admin"]),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { username, password, role } = req.body;

//     try {
//       // Check if user exists
//       let user = await User.findOne({ username });
//       if (user) {
//         return res.status(400).json({ msg: "User already exists" });
//       }

//       // Create new user
//       user = new User({ username, password, role });
//       await user.save();

//       // Create JWT payload
//       const payload = { user: { id: user.id, role: user.role } };

//       // Sign token
//       jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: "5h" },
//         (err, token) => {
//           if (err) throw err;
//           res.json({ token });
//         }
//       );
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// router.get("/me", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

module.exports = router;
