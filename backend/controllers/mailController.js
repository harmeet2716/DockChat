const Mail = require("../models/Mail");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

const sendMail = async (req, res) => {
  const { recipients, subject, content, threadId, attachments } = req.body;

  if (!recipients || !recipients.to || !subject || !content) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const newMail = await Mail.create({
      sender: req.user._id,
      recipients,
      subject,
      content,
      threadId: threadId || uuidv4(),
      attachments: attachments || [],
      folder: "sent",
    });

    // Create a copy for the recipients' inbox
    // For now, we simplify: just mark it in their system
    // In a real multi-user system, we might duplicate the record or use references
    const populatedMail = await newMail.populate("sender", "name email profilePic");

    res.status(201).json(populatedMail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMails = async (req, res) => {
  const { folder } = req.query; // inbox, sent, starred, trash
  try {
    let query = {};
    if (folder === "sent") {
      query = { sender: req.user._id, folder: "sent" };
    } else if (folder === "starred") {
      query = { 
        $or: [
          { sender: req.user._id },
          { "recipients.to": req.user.email }
        ],
        isStarred: true 
      };
    } else {
      // Inbox default
      query = { "recipients.to": req.user.email };
    }

    const mails = await Mail.find(query)
      .populate("sender", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(mails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleStar = async (req, res) => {
  try {
    const mail = await Mail.findById(req.params.id);
    if (!mail) return res.status(404).json({ message: "Mail not found" });

    mail.isStarred = !mail.isStarred;
    await mail.save();
    res.status(200).json(mail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMail, getMails, toggleStar };
