import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "error", "warn"], default: "info" },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const Log = mongoose.model("Log", logSchema);
