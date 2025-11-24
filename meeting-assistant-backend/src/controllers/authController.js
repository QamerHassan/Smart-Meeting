const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

class AuthController {
  // ---------------------------
  // REGISTER
  // ---------------------------
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validate request
      if (!email || !password || !name) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await UserModel.create(email, hashedPassword, name);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "7d" }
      );

      // Return response
      res.status(201).json({
        message: "User registered successfully",
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  // ---------------------------
  // LOGIN
  // ---------------------------
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "secret_key",
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  // ---------------------------
  // GET LOGGED-IN USER
  // ---------------------------
  static async getMe(req, res) {
    try {
      // req.userId should come from authMiddleware
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  }
}

module.exports = AuthController;
