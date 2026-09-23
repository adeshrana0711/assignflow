import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { Admin } from "../models/admin.model.js";

dotenv.config({ path: "../.env" });

// Use public DNS servers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("MONGO_URI:", process.env.MONGO_URI ? "FOUND" : "MISSING");

await mongoose.connect(process.env.MONGO_URI);

const admin = new Admin({
  username: "superadmin",
  email: "admin@uni.com",
  password: "admin123"
});

await admin.save();

console.log("✅ Admin created successfully");

process.exit();