import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { familyMembers, users } from "@/drizzle/db/schema";
import { and, eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    
    // Fetch family members where the current user is the owner
    const myFamily = await db.query.familyMembers.findMany({
      where: eq(familyMembers.ownerId, userId),
    });

    // Also fetch cases where the current user IS a family member of someone else
    const partOfFamily = await db.query.familyMembers.findMany({
      where: eq(familyMembers.memberId, userId),
    });

    // Combine and get user details for each member
    const allMemberRelationships = [...myFamily, ...partOfFamily];
    
    const detailedMembers = await Promise.all(
      allMemberRelationships.map(async (rel: any) => {
        // If I'm owner, get details of memberId (if exists) or use the invitation email/name
        // If I'm member, get details of ownerId
        let targetUserId = rel.ownerId === userId ? rel.memberId : rel.ownerId;
        
        let userDetails = null;
        if (targetUserId) {
          userDetails = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
          });
        }

        return {
          id: rel.id,
          userId: targetUserId,
          name: userDetails?.name || rel.name,
          email: userDetails?.email || rel.email,
          avatar: userDetails?.image,
          relationship: rel.relationship,
          status: rel.status,
          role: rel.role,
        };
      })
    );

    return NextResponse.json({ members: detailedMembers });
  } catch (error) {
    console.error("Error fetching family:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, name, relationship } = await req.json();

    if (!email || !relationship) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const newMemberId = uuidv4();
    await db.insert(familyMembers).values({
      id: newMemberId,
      ownerId: session.user.id,
      memberId: existingUser?.id || null,
      email,
      name,
      relationship,
      status: "pending",
      role: "member",
    });

    return NextResponse.json({ 
      success: true, 
      memberId: newMemberId,
      message: existingUser ? "Member added and invitation sent." : "Invitation sent to email."
    });
  } catch (error) {
    console.error("Error adding family member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
