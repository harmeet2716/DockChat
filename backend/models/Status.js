const mongoose = require("mongoose");

const StatusSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true }, // Media URL
    type: { type: String, enum: ["image", "video"], default: "image" },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // 24 hours expiry
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", StatusSchema);
