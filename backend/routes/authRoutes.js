const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

module.exports = router;
