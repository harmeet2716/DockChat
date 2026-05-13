const express = require("express");
const { sendMail, getMails, toggleStar } = require("../controllers/mailController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .post(protect, sendMail)
  .get(protect, getMails);

router.route("/:id/star").patch(protect, toggleStar);

module.exports = router;
