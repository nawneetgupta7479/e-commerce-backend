import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    clerkId: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["order", "payment", "delivery", "product", "account", "other"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    ticketNumber: {
      type: String,
      unique: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Generate ticket number before saving
issueSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Issue").countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

export const Issue = mongoose.model("Issue", issueSchema);