import mongoose from "mongoose";

declare global {
  // allow attaching mongoose to global to persist connection across module reloads in dev
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
