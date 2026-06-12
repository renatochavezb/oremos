import { MongoClient } from "mongodb";
import { configureMongoDns } from "@/libs/mongoDns";
import { resolveMongoUri } from "@/libs/resolveMongoUri";

configureMongoDns();

// This lib is use just to connect to the database in next-auth.
// We don't use it anywhere else in the API routes—we use mongoose.js instead (to be able to use models)
// See /libs/nextauth.js file.

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 8000,
};

let clientPromise;

function createClientPromise() {
  return resolveMongoUri(uri)
    .then((resolvedUri) => {
      const client = new MongoClient(resolvedUri, options);
      return client.connect();
    })
    .catch((error) => {
      if (process.env.NODE_ENV === "development") {
        global._mongoClientPromise = null;
      }
      console.error("Mongo Client Error:", error.message);
      throw error;
    });
}

if (!uri) {
  console.group("⚠️ MONGODB_URI missing from .env");
  console.error(
    "It's not mandatory but a database is required for Magic Links."
  );
  console.error(
    "If you don't need it, remove the code from /libs/next-auth.js (see connectMongo())"
  );
  console.groupEnd();
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;
