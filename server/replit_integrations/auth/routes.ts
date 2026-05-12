import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import logger from "../../logger";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user.claims.email;
      if (!userEmail) {
        return res.status(400).json({ message: "Email not available" });
      }
      const user = await authStorage.getUser(userEmail);
      res.json(user);
    } catch (error) {
      logger.error("auth", "Error fetching user", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
