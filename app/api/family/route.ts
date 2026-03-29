import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { familyMembers, users, notifications } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
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
      allMemberRelationships.map(async (rel) => {
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
      }),
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

    // Check if already in family
    const alreadyConnected = await db.query.familyMembers.findFirst({
      where: (fm, { and, eq }) => and(eq(fm.ownerId, session.user.id), eq(fm.email, email)),
    });

    if (alreadyConnected) {
      return NextResponse.json({ error: "Already invited or connected" }, { status: 400 });
    }

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

    // Notification trigger
    if (existingUser) {
      await db.insert(notifications).values({
        id: uuidv4(),
        userId: existingUser.id,
        type: "family_invite",
        title: "Family Invitation",
        message: `${session.user.name || "Someone"} invited you to join their family circle as a ${relationship}.`,
        relatedId: newMemberId,
        read: false,
      });
    }

    return NextResponse.json({
      success: true,
      memberId: newMemberId,
      message: existingUser ? "Member added and invitation sent." : "Invitation sent to email.",
    });
  } catch (error) {
    console.error("Error adding family member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { inviteId, status } = await req.json();

    if (!inviteId || !["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Find the invite
    const invite = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, inviteId),
    });

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Only the target member can respond
    if (invite.memberId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status === "declined") {
      // If declined, we can delete the record or mark as declined.
      // Requirements say "Accept/Decline flow", so marking as declined for now,
      // or just deleting if we want a clean state. Let's delete to allow re-invite.
      await db.delete(familyMembers).where(eq(familyMembers.id, inviteId));

      return NextResponse.json({ success: true, message: "Invitation declined" });
    }

    // Accept invitation
    await db
      .update(familyMembers)
      .set({
        status: "accepted",
        joinedAt: new Date(),
      })
      .where(eq(familyMembers.id, inviteId));

    // Notify the owner
    await db.insert(notifications).values({
      id: uuidv4(),
      userId: invite.ownerId,
      type: "family_invite",
      title: "Invitation Accepted",
      message: `${session.user.name || "A user"} has accepted your family circle invitation.`,
      relatedId: session.user.id,
      read: false,
    });

    return NextResponse.json({ success: true, message: "Invitation accepted" });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
