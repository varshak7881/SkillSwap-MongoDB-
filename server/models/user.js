const mongoose = require("mongoose");

const teachSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  description: { type: String }
});

const learnSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" }
});

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar:       { type: String, default: "" },
  bio:          { type: String, default: "" },
  teachSkills:  [teachSkillSchema],
  learnSkills:  [learnSkillSchema],
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }
  },
  rating:         { type: Number, default: 0 },
  completedSwaps: { type: Number, default: 0 },
  badges:         [{ name: String, earnedAt: Date }]
}, { timestamps: true });

userSchema.index({ location: "2dsphere" });
userSchema.index({ "teachSkills.name": "text", "learnSkills.name": "text" });

module.exports = mongoose.model("User", userSchema);