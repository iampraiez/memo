import db from "@/drizzle";
import { users } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function userExists(email: string) {
  try {
    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return results[0] || null;
  } catch {
    return null;
  }
}
