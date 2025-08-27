import db from "@/drizzle";
import { users } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";

export async function userExists(email: string) {
  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (!user) return false;
    return user;
  } catch (err) {
    console.log(err);
  }
}
