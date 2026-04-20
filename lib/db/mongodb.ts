import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Variable MONGODB_URI manquante dans .env.local');
}

// Cache global pour réutiliser la connexion entre les requêtes (important en dev Next.js)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  // Connexion déjà établie → on la réutilise
  if (cache.conn) return cache.conn;

  // Connexion en cours → on attend qu'elle finisse
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log('✅ MongoDB connecté');
        return m;
      })
      .catch((err) => {
        // Reset pour permettre une nouvelle tentative
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
