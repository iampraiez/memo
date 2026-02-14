import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";
import { logger } from "@/lib/logger";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

// Singleton pattern for DB connection in development
// to avoid "too many connections" or "authentication timeout" errors during HMR
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
  db: NodePgDatabase<typeof schema> | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased to 10s for stability in dev
  });

const db = globalForDb.db ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.db = db;
}

async function testDbConnection() {
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    logger.info("Database connected successfully", {
      timestamp: result.rows[0]?.now,
    });
  } catch (error) {
    logger.error("Database connection failed", { error });
  }
}

// Only log connection success on initial load or if explicitly needed
// to avoid flooding logs during HMR
if (!globalForDb.pool) {
    testDbConnection();
}

export default db;
export type DbType = typeof db;
