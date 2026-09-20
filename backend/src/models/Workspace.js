import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

workspaceSchema.methods.roleOf = function (userId) {
  const entry = this.members.find((m) => m.user.toString() === userId.toString());
  return entry ? entry.role : null;
};

export default mongoose.model("Workspace", workspaceSchema);
