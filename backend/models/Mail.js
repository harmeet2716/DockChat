const mongoose = require("mongoose");

const MailSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipients: {
      to: [{ type: String, required: true }],
      cc: [{ type: String }],
      bcc: [{ type: String }],
    },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    threadId: { type: String, required: true }, // For grouping conversations
    isStarred: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    folder: { 
      type: String, 
      enum: ["inbox", "sent", "drafts", "trash"], 
      default: "inbox" 
    },
    attachments: [{ 
      name: { type: String },
      url: { type: String }
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mail", MailSchema);
