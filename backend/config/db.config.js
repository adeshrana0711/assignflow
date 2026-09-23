import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1);
  }
};

export default connectDB;