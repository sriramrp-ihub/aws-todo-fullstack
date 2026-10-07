import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { authService } from "../services/authService";
import { metricsService } from "../services/metricsService";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      const result = await authService.register(email, password, name);
      metricsService.recordUserRegistered();

      return res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "Email already exists") {
        return res.status(400).json({ message: error.message });
      }
      console.error("Register error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ message: error.message });
      }
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.userId;

      const user = await authService.getUserById(userId);

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async logout(req: Request, res: Response) {
    return res.status(200).json({ message: "Logged out successfully" });
  }
}

export const authController = new AuthController();
