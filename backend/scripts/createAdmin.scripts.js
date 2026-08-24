import mongoose from "mongoose";
import dotenv from "dotenv";
import {Admin} from "../models/admin.model.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const admin = new Admin({
  username: "superadmin",
  email: "admin@uni.com",
  password: "admin123"
});
await admin.save();
console.log("✅ Admin created successfully");
process.exit();