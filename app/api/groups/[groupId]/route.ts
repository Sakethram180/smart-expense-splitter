import { Types } from "mongoose";

import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeGroupDetail } from "@/lib/serializers";
import { requireUser } from "@/lib/server-auth";
import { applyInstability } from "@/lib/unstable-api";
import { Expense } from "@/models/Expense";
import { Group } from "@/models/Group";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireUser();
    const { groupId } = await params;
    await connectToDatabase();

    const group = await Group.findOne({
      _id: new Types.ObjectId(groupId),
      members: new Types.ObjectId(user.id)
    })
      .populate("members", "name email");

    if (!group) {
      return jsonError("Group not found.", 404);
    }

    const expenses = await Expense.find({ group: new Types.ObjectId(groupId) })
      .populate("paidBy", "name email")
      .populate("participants", "name email")
      .sort({ date: -1, createdAt: -1 });

    const detail = serializeGroupDetail(
      group.toObject() as Parameters<typeof serializeGroupDetail>[0],
      expenses.map(
        (expense) => expense.toObject()
      ) as unknown as Parameters<typeof serializeGroupDetail>[1]
    );
    const unstableDetail = {
      ...detail,
      expenses: await applyInstability(detail.expenses, {
        allowDuplicate: true,
        allowEmpty: true
      })
    };

    return jsonOk(unstableDetail);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleApiError(error);
  }
}
