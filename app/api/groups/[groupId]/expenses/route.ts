import { Types } from "mongoose";

import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeExpense } from "@/lib/serializers";
import { requireGroupMember, requireUser } from "@/lib/server-auth";
import { expenseSchema } from "@/lib/validation";
import { Expense } from "@/models/Expense";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireUser();
    const { groupId } = await params;
    const body = expenseSchema.parse(await request.json());
    await connectToDatabase();

    const group = await requireGroupMember(groupId, user.id);

    if (!group) {
      return jsonError("Group not found.", 404);
    }

    const memberIds = (group.members as Types.ObjectId[]).map((memberId: Types.ObjectId) =>
      String(memberId)
    );
    const everyoneBelongs = [body.paidBy, ...body.participants].every((id) => memberIds.includes(id));

    if (!everyoneBelongs) {
      return jsonError("Expense members must belong to this group.", 422);
    }

    const expense = await Expense.create({
      group: new Types.ObjectId(groupId),
      title: body.title,
      amount: body.amount,
      paidBy: new Types.ObjectId(body.paidBy),
      participants: body.participants.map((participant) => new Types.ObjectId(participant)),
      date: new Date(body.date)
    });

    await expense.populate("paidBy", "name email");
    await expense.populate("participants", "name email");

    return jsonOk(serializeExpense(expense.toObject()), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleApiError(error);
  }
}
