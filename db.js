import mongoose from "mongoose";

export const db = async (url) => {
  const connection = await mongoose.connect(url);
  console.log("Database connected");
  return connection;
};
