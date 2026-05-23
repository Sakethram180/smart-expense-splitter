import { Types } from "mongoose";

import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Group } from "@/models/Group";
import { User } from "@/models/User";

export async function requireUser() {
  const session = await getSessionUser();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();
  const user = await User.findById(session.id);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email
  };
}

export async function requireGroupMember(groupId: string, userId: string) {
  await connectToDatabase();

  const group = await Group.findOne({
    _id: new Types.ObjectId(groupId),
    members: new Types.ObjectId(userId)
  });

  if (!group) {
    throw new Error("Group not found or access denied.");
  }

  return group;
}
