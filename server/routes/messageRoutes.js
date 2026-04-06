const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  sendMessage,
  getMessages,
  markAsSeen
} = require("../controllers/messageController");

router.post("/",                          protect, sendMessage);
router.get("/:barterRequestId",           protect, getMessages);
router.put("/:barterRequestId/seen",      protect, markAsSeen);

module.exports = router;