import "server-only";
import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

/**
 * One pooled MongoClient, cached on globalThis so it survives Next's dev
 * hot-reloads and is reused across serverless invocations on Netlify.
 */

const DB_NAME = process.env.MONGODB_DB ?? "freshfusion";

type Cache = { client?: Promise<MongoClient> };
const cache: Cache = (globalThis as typeof globalThis & { _ffMongo?: Cache })
  ._ffMongo ?? {};
(globalThis as typeof globalThis & { _ffMongo?: Cache })._ffMongo = cache;

/**
 * `mongodb+srv://` needs a DNS SRV lookup, which some local resolvers (notably
 * on Windows / certain ISPs) refuse with `querySrv EREFUSED`. Point Node at a
 * public resolver when that happens. No effect on hosts whose resolver works
 * (Netlify, most Linux).
 */
async function ensureSrvResolvable(uri: string): Promise<void> {
  if (!uri.startsWith("mongodb+srv://")) return;
  const host = uri.split("@")[1]?.split(/[/?]/)[0];
  if (!host) return;
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
  } catch {
    dns.setServers(["1.1.1.1", "8.8.8.8", ...dns.getServers()]);
  }
}

export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (dev) or the host's environment (prod).",
    );
  }
  if (!cache.client) {
    cache.client = ensureSrvResolvable(uri).then(() =>
      new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 }).connect(),
    );
  }
  return cache.client;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

/** test helper — drop the cached connection so a new URI takes effect */
export async function __resetMongo(): Promise<void> {
  if (cache.client) {
    const client = await cache.client.catch(() => null);
    await client?.close().catch(() => {});
    cache.client = undefined;
  }
}
