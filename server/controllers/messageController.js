const Message = require("../models/Message");
const BarterRequest = require("../models/BarterRequest");

// @route   POST /api/messages
// Send a message
const sendMessage = async (req, res) => {
  try {
    const { barterRequestId, content } = req.body;

    // Verify barter request exists and user is involved
    const barter = await BarterRequest.findById(barterRequestId);
    if (!barter) {
      return res.status(404).json({ message: "Barter request not found" });
    }

    const isInvolved =
      barter.from.toString() === req.user.id ||
      barter.to.toString() === req.user.id;

    if (!isInvolved) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Barter must be accepted or completed
    if (!["accepted", "completed"].includes(barter.status)) {
      return res.status(400).json({ message: "Barter must be active to send messages" });
    }

    const message = await Message.create({
      barterRequest: barterRequestId,
      sender: req.user.id,
      content
    });

    // Populate sender details before returning
    await message.populate("sender", "name avatar");

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/messages/:barterRequestId
// Get all messages for a barter request
const getMessages = async (req, res) => {
  try {
    const barter = await BarterRequest.findById(req.params.barterRequestId);
    if (!barter) {
      return res.status(404).json({ message: "Barter request not found" });
    }

    const isInvolved =
      barter.from.toString() === req.user.id ||
      barter.to.toString() === req.user.id;

    if (!isInvolved) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({
      barterRequest: req.params.barterRequestId
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/messages/:barterRequestId/seen
// Mark all messages as seen
const markAsSeen = async (req, res) => {
  try {
    await Message.updateMany(
      {
        barterRequest: req.params.barterRequestId,
        sender: { $ne: req.user.id },
        seen: false
      },
      { seen: true }
    );

    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, markAsSeen };