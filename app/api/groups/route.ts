import { Types } from "mongoose";

import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeGroupSummary } from "@/lib/serializers";
import { requireUser } from "@/lib/server-auth";
import { applyInstability } from "@/lib/unstable-api";
import { groupSchema } from "@/lib/validation";
import { Expense } from "@/models/Expense";
import { Group } from "@/models/Group";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const groups = await Group.find({ members: new Types.ObjectId(user.id) })
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    const expenseStats = await Promise.all(
      groups.map(async (group) => {
        const stats = await Expense.aggregate([
          { $match: { group: group._id } },
          {
            $group: {
              _id: "$group",
              totalSpent: { $sum: "$amount" },
              expenseCount: { $sum: 1 }
            }
          }
        ]);

        return {
          groupId: String(group._id),
          totalSpent: stats[0]?.totalSpent ?? 0,
          expenseCount: stats[0]?.expenseCount ?? 0
        };
      })
    );

    const summaries = groups.map((group) => {
      const stats = expenseStats.find((item) => item.groupId === String(group._id));
      return serializeGroupSummary(
        group.toObject() as Parameters<typeof serializeGroupSummary>[0],
        stats?.expenseCount ?? 0,
        stats?.totalSpent ?? 0
      );
    });

    const unstableSummaries = await applyInstability(summaries, {
      allowDuplicate: true,
      allowEmpty: true
    });

    return jsonOk(unstableSummaries);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = groupSchema.parse(await request.json());
    await connectToDatabase();

    const group = await Group.create({
      name: body.name,
      description: body.description,
      createdBy: new Types.ObjectId(user.id),
      members: [new Types.ObjectId(user.id)]
    });

    await group.populate("members", "name email");

    return jsonOk(
      serializeGroupSummary(group.toObject() as Parameters<typeof serializeGroupSummary>[0], 0, 0),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleApiError(error);
  }
}
