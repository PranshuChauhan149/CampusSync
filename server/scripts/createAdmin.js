import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const adminEmail = "admin@campussync.com";
    const adminPassword = "Admin@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    // Create admin user
    const admin = new User({
      email: adminEmail,
      username: "Admin",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("\nPlease change this password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
