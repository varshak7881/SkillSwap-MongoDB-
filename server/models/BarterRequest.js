const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  date:     { type: Date, required: true },
  duration: { type: Number },  // in minutes
  notes:    { type: String }
});

const barterRequestSchema = new mongoose.Schema({
  from:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offeredSkill: { type: String, required: true },
  wantedSkill:  { type: String, required: true },
  message:      { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending"
  },
  sessions: [sessionSchema]
}, { timestamps: true });

module.exports = mongoose.model("BarterRequest", barterRequestSchema);