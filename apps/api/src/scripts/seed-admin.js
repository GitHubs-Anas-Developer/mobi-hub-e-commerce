
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@mobihub.com";
    const password = "Admin@12345";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        throw new Error("This email belongs to a customer account");
      }

      existingAdmin.password = password;
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;

      await existingAdmin.save();

      console.log("Admin password reset successfully");
    } else {
      await User.create({
        name: "MOBI HUB Admin",
        email,
        password,
        phone: "9876543211",
        role: "admin",
        isActive: true,
        isEmailVerified: true,
      });

      console.log("Admin created successfully");
    }

    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
