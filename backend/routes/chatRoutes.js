const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
  accessChat, 
  fetchChats, 
  createGroupChat, 
  addToGroup, 
  removeFromGroup,
  syncContacts,
  clearChat,
  deleteChat
} = require("../controllers/chatController");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/sync").post(protect, syncContacts);
router.route("/group").post(protect, createGroupChat);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/:chatId/clear").delete(protect, clearChat);
router.route("/:chatId").delete(protect, deleteChat);

module.exports = router;
