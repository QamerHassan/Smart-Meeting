const express = require("express");
const AuthController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  AuthController.register(req, res);
});

// Login
router.post("/login", (req, res) => {
  AuthController.login(req, res);
});

// Get logged-in user
router.get("/me", authMiddleware, (req, res) => {
  AuthController.getMe(req, res);
});

module.exports = router;
