const BarterRequest = require("../models/BarterRequest");
const User = require("../models/User");

// @route   POST /api/barter
// Send a barter request to another user
const sendRequest = async (req, res) => {
  try {
    const { to, offeredSkill, wantedSkill, message } = req.body;

    // Can't send request to yourself
    if (req.user.id === to) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    // Check if request already exists
    const existing = await BarterRequest.findOne({
      from: req.user.id,
      to,
      status: "pending"
    });
    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = await BarterRequest.create({
      from: req.user.id,
      to,
      offeredSkill,
      wantedSkill,
      message
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/barter/incoming
// Get all incoming barter requests
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await BarterRequest.find({ to: req.user.id })
      .populate("from", "name avatar rating teachSkills")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/barter/outgoing
// Get all outgoing barter requests
const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await BarterRequest.find({ from: req.user.id })
      .populate("to", "name avatar rating teachSkills")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/barter/:id/accept
// Accept a barter request
const acceptRequest = async (req, res) => {
  try {
    const request = await BarterRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the receiver can accept
    if (request.to.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" });
    }

    request.status = "accepted";
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/barter/:id/reject
// Reject a barter request
const rejectRequest = async (req, res) => {
  try {
    const request = await BarterRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the receiver can reject
    if (request.to.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/barter/:id/complete
// Mark a barter request as completed
const completeRequest = async (req, res) => {
  try {
    const request = await BarterRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only sender or receiver can complete
    const isInvolved =
      request.from.toString() === req.user.id ||
      request.to.toString() === req.user.id;

    if (!isInvolved) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Request must be accepted first" });
    }

    request.status = "completed";
    await request.save();

    // Increment completedSwaps for both users
    await User.findByIdAndUpdate(request.from, { $inc: { completedSwaps: 1 } });
    await User.findByIdAndUpdate(request.to,   { $inc: { completedSwaps: 1 } });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/barter/:id/sessions
// Add a session to an active barter
const addSession = async (req, res) => {
  try {
    const { date, duration, notes } = req.body;

    const request = await BarterRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Barter must be active to add sessions" });
    }

    request.sessions.push({ date, duration, notes });
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  addSession
};