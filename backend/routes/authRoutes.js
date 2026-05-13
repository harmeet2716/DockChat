const express = require("express");
const { sendOTP, verifyOTP, updateProfile, syncContacts, searchUsers, registerUser, loginUser, verifyEmailOTP, sendEmailOTP, toggleFollow, getSuggestedUsers, checkUsername } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/check-username", checkUsername);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmailOTP);
router.post("/resend-email-otp", sendEmailOTP);
router.post("/follow", protect, toggleFollow);
router.get("/suggested", protect, getSuggestedUsers);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updateProfile);
router.post("/sync-contacts", protect, syncContacts);

module.exports = router;
