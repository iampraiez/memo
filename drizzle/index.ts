import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema";
import { logger } from "@/lib/logger";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!, { schema });

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

testDbConnection();

export default db;
