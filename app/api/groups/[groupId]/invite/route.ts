import { Types } from "mongoose";

import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { requireUser } from "@/lib/server-auth";
import { inviteSchema } from "@/lib/validation";
import { Group } from "@/models/Group";
import { User } from "@/models/User";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const currentUser = await requireUser();
    const { groupId } = await params;
    const body = inviteSchema.parse(await request.json());
    await connectToDatabase();

    const group = await Group.findOne({
      _id: new Types.ObjectId(groupId),
      members: new Types.ObjectId(currentUser.id)
    });

    if (!group) {
      return jsonError("Group not found.", 404);
    }

    const invitedUser = await User.findOne({ email: body.email.toLowerCase() });

    if (!invitedUser) {
      return jsonError("No registered user found for that email.", 404);
    }

    const groupMemberIds = group.members as Types.ObjectId[];
    const isAlreadyMember = groupMemberIds.some(
      (memberId: Types.ObjectId) => String(memberId) === String(invitedUser._id)
    );

    if (isAlreadyMember) {
      return jsonError("This user is already in the group.", 409);
    }

    group.members.push(invitedUser._id);
    await group.save();
    await group.populate("members", "name email");

    return jsonOk(
      (group.members as Array<{ _id: Types.ObjectId; name: string; email: string }>).map((member) => ({
        id: String(member._id),
        name: member.name,
        email: member.email
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleApiError(error);
  }
}
