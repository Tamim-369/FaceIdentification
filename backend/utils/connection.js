import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connect = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  if (conn) {
    console.log("Database connected");
  } else {
    console.log("Unable to connect to database");
  }
};
