const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  barterRequest: { type: mongoose.Schema.Types.ObjectId, ref: "BarterRequest", required: true },
  sender:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:       { type: String, required: true },
  seen:          { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);