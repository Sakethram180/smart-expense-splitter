import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const expenseSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    date: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

export type ExpenseDocument = Omit<
  InferSchemaType<typeof expenseSchema>,
  "group" | "paidBy" | "participants"
> & {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  paidBy: Types.ObjectId;
  participants: Types.ObjectId[];
};

export const Expense = models.Expense || model("Expense", expenseSchema);
