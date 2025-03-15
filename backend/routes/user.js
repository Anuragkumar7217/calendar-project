const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkRole = require("./middleware/roleCheck");

router.get("/profile", [auth, checkRole(["user", "admin"])], (req, res) => {
  res.json({ msg: "User profile data" });
});

module.exports = router;
