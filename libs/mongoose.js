import mongoose from "mongoose";
import { configureMongoDns } from "@/libs/mongoDns";
import { resolveMongoUri } from "@/libs/resolveMongoUri";

configureMongoDns();

const MONGODB_URI = process.env.MONGODB_URI;

const connectMongo = async () => {
  if (!MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (global.mongoosePromise) {
    return global.mongoosePromise;
  }

  global.mongoosePromise = resolveMongoUri(MONGODB_URI)
    .then((resolvedUri) =>
      mongoose.connect(resolvedUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
    )
    .then((connection) => connection)
    .catch((error) => {
      global.mongoosePromise = null;
      console.error("Mongoose Client Error:", error.message);
      throw error;
    });

  return global.mongoosePromise;
};

export default connectMongo;
