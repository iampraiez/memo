import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";

const db = drizzle(process.env.DATABASE_URL!);

export default db;
