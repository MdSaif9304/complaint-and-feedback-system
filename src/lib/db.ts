import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable (set it in Vercel → Project → Settings → Environment Variables for the Production AND Preview environments)."
  );
}

/**
 * Cache the connection across invocations. On Vercel, serverless functions
 * freeze between requests; reusing the cached connection avoids opening a new
 * one (and exhausting Atlas's connection limit) on every warm request.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };

if (!global._mongoose) {
  global._mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting.
  const state = mongoose.connection.readyState;

  // Reuse the cached connection only if it is actually still connected.
  if (cached.conn && state === 1) {
    return cached.conn;
  }

  // If the socket dropped while the function was idle (a common serverless case
  // when navigating back to a page), the cached promise resolved to a dead
  // connection. Discard it so we open a genuinely fresh one below.
  if (state === 0 || state === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        // Buffer queries until connected instead of throwing on a cold start.
        bufferCommands: true,
        // Fail fast (well inside Vercel's function timeout) with a clear error
        // instead of hanging for the 30s default when Atlas is unreachable.
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        // Keep the serverless connection pool small.
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the next request retries instead of reusing a rejected promise.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
