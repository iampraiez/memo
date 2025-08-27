import { NextResponse, NextRequest } from "next/server";
import db from "@/drizzle/index";
import { users } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // Import uuid

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    console.log("Registration data:", { email, password });

    // user exists?
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists", success: false },
        { status: 200 } // Changed status to 409 Conflict
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    const newUser = await db
      .insert(users)
      .values({
        id: uuidv4(), // Generate a UUID for the id
        email: email,
        password: hashedPassword,
        // stuffs for new users
      })
      .returning();

    if (newUser.length === 0) {
      throw new Error("Failed to create user.");
    }

    return NextResponse.json(
      { message: "User registered successfully", success: true },
      { status: 201 }
    );
  } catch (error: any) {
    // Type 'error' as 'any' to access message property
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" }, // Return error message
      { status: 500 }
    );
  }
}
