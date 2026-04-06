const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  addSession
} = require("../controllers/barterController");

router.post("/",                protect, sendRequest);
router.get("/incoming",         protect, getIncomingRequests);
router.get("/outgoing",         protect, getOutgoingRequests);
router.put("/:id/accept",       protect, acceptRequest);
router.put("/:id/reject",       protect, rejectRequest);
router.put("/:id/complete",     protect, completeRequest);
router.post("/:id/sessions",    protect, addSession);

module.exports = router;