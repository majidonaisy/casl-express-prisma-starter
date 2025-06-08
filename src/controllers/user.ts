import { Request, Response } from "express";
import UserService from "../services/user";
import bcrypt from "bcrypt";
import { subject } from "@casl/ability";
import { User } from "@prisma/client";

const userService = new UserService();

export const userController = {
  // Get all users
  getAllUsers: async (req: Request, res: Response) => {
    try {
      // Check if user has permission to read users
      if (!req.ability?.can("read", "User")) {
        return res
          .status(403)
          .json({
            message: "Forbidden: You don't have permission to read users",
          });
      }

      const users = await userService.getAllUsers();

      // Remove password from response
      const usersWithoutPassword = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },
  // Get user by ID
  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user can read this specific user or any user
      if (!req.ability?.can("read", subject("User", user))) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to read this user",
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  },
  // Create a new user
  createUser: async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check if user can create users (only for authenticated routes)
      if (req.ability && !req.ability.can("create", "User")) {
        console.log(req.ability)
        return res.status(403).json({
          message: "Forbidden: You don't have permission to create users",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await userService.createUser({
        email,
        password: hashedPassword,
        name,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);

      if (error instanceof Error) {
        if (error.message.includes("Unique constraint")) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      res.status(500).json({ message: "Failed to create user" });
    }
  },
  // Update user
  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { email, name } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get the user to check permissions
      const existingUser = await userService.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user can update this specific user
      if (!req.ability?.can("update", subject("User", existingUser))) {
        return res.status(403).json({
          message: "Forbidden: You don't have permission to update this user",
        });
      }

      const user = await userService.updateUser(userId, { email, name });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);

      if (error instanceof Error) {
        if (error.message.includes("Record to update not found")) {
          return res.status(404).json({ message: "User not found" });
        }
        if (error.message.includes("Unique constraint")) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      res.status(500).json({ message: "Failed to update user" });
    }
  },

  // Delete user
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      await userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);

      if (error instanceof Error) {
        if (error.message.includes("Record to delete does not exist")) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      res.status(500).json({ message: "Failed to delete user" });
    }
  }
};
