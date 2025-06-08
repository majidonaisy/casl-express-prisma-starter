import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing permissions first
    await prisma.permission.deleteMany({});
    console.log("✅ Cleared existing permissions");

    await prisma.permission.createMany({
      data: [
        // ==== ARTICLE ====
        {
          action: "create",
          subject: "Article",
          conditions: { authorId: "$user.id" },
        },
        {
          action: "read",
          subject: "Article",
          conditions: { authorId: "$user.id" },
        },
        {
          action: "update",
          subject: "Article",
          conditions: { authorId: "$user.id" },
        },
        {
          action: "delete",
          subject: "Article",
          conditions: { authorId: "$user.id" },
        },

        // Admin full access
        { action: "manage", subject: "Article", conditions: {} },

        // ==== USER (Self-management only) ====
        { action: "read", subject: "User", conditions: { id: "$user.id" } },
        { action: "update", subject: "User", conditions: { id: "$user.id" } },
        { action: "delete", subject: "User", conditions: { id: "$user.id" } },

        // Admin full access
        { action: "manage", subject: "User", conditions: {} },
      ],
    });

    console.log("✅ Permissions seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    throw error;
  }
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
  })
  .finally(async () => {
    console.log("🔌 Disconnecting from database...");
    await prisma.$disconnect();
  });
