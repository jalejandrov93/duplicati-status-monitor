import mongoose from "mongoose";



let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI as string;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  mongoose.connection.on("error", (err) => {
    console.error("Mongo error:", err);
  });

  mongoose.connection.once("open", () => {
    console.log("✅ MongoDB connected");
  });

  cached.conn = await cached.promise;
  return cached.conn;
}
