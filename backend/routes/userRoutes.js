const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { searchUserByPhone } = require("../controllers/userController");

const router = express.Router();

router.get("/search", protect, searchUserByPhone);

module.exports = router;
