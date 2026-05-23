import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const groupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }]
  },
  {
    timestamps: true
  }
);

export type GroupDocument = Omit<InferSchemaType<typeof groupSchema>, "createdBy" | "members"> & {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
};

export const Group = models.Group || model("Group", groupSchema);
