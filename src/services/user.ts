import prisma from "../lib/prisma";

export default class UserService {
  constructor() {
    // Initialize any dependencies or properties here
  }

  async getUserById(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      return user;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw new Error("Failed to fetch user");
    }
  }
  
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async createUser(data: { email: string; password: string; name?: string }) {
    const roleId = await prisma.role.findFirst({
      where: {
        name: {
          mode: "insensitive",
          equals: "user", // Assuming you want to assign the 'user' role by default
        },
      },
      select: {
        id: true,
      },
    });
    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: data.password, // Ensure you hash the password before storing it
          name: data.name,
          roleId: roleId?.id || 1, // Default to role ID 1 if not found
        },
      });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(userId: number, data: { email?: string; name?: string }) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
      });
      return user;
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      throw new Error("Failed to update user");
    }
  }

  async deleteUser(userId: number) {
    try {
      const user = await prisma.user.delete({
        where: { id: userId },
      });
      return user;
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      throw new Error("Failed to delete user");
    }
  }
}
