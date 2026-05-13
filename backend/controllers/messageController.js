const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

const sendMessage = async (req, res) => {
  const { content, chatId, messageType, mediaUrl } = req.body;

  if (!chatId || (!content && !mediaUrl)) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    messageType: messageType || "text",
    mediaUrl: mediaUrl || "",
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name profilePic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profilePic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name profilePic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id }, $set: { status: "read" } }
    );
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages, markAsRead };
