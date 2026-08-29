// scripts/seedAdmin.ts
import db from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  await db();

  const email = "admin@gmail.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists, skipping.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "admin",
  });

  console.log("Admin account created.");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});