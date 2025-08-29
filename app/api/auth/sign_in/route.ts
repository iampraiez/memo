import { NextRequest, NextResponse } from "next/server";
import { userExists } from "@/app/_lib/query";

// check if user exists in db
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user: email } = body;
    console.log(email, body);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await userExists(email);
    console.log(user);

    // Return the result as JSON
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error in check-user route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
