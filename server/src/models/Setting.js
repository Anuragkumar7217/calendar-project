import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});

export const Setting = mongoose.model("Setting", settingSchema);
