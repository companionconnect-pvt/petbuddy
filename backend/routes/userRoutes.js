const express = require("express");
const { getCurrentUser, updateCurrentUser } = require("../controllers/userController");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.get("/me", verifyToken, getCurrentUser);

router.put("/me", verifyToken, updateCurrentUser);

module.exports = router;
