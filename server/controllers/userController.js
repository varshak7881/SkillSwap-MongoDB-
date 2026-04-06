const User = require("../models/User");

// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/users/teach-skills
const addTeachSkill = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { teachSkills: { name, level, description } } },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/users/teach-skills/:skillId
const removeTeachSkill = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { teachSkills: { _id: req.params.skillId } } },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/users/learn-skills
const addLearnSkill = async (req, res) => {
  try {
    const { name, urgency } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { learnSkills: { name, urgency } } },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/users/learn-skills/:skillId
const removeLearnSkill = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { learnSkills: { _id: req.params.skillId } } },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/users/match
// Finds users whose teachSkills match your learnSkills
const getMatchedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Extract skills current user wants to learn
    const learnSkillNames = currentUser.learnSkills.map(s => s.name.toLowerCase());

    if (learnSkillNames.length === 0) {
      return res.status(400).json({ message: "Add skills you want to learn first" });
    }

    // Aggregation pipeline — find matching users
    const matches = await User.aggregate([
      // Exclude current user
      { $match: { _id: { $ne: currentUser._id } } },

      // Add a field — how many of their teachSkills match your learnSkills
      {
        $addFields: {
          matchScore: {
            $size: {
              $filter: {
                input: "$teachSkills",
                as: "skill",
                cond: {
                  $in: [{ $toLower: "$$skill.name" }, learnSkillNames]
                }
              }
            }
          }
        }
      },

      // Only keep users with at least 1 match
      { $match: { matchScore: { $gt: 0 } } },

      // Sort by best match first
      { $sort: { matchScore: -1, rating: -1 } },

      // Remove sensitive fields
      { $project: { passwordHash: 0 } }
    ]);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/users/location
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: { type: "Point", coordinates: [longitude, latitude] } },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  addTeachSkill,
  removeTeachSkill,
  addLearnSkill,
  removeLearnSkill,
  getMatchedUsers,
  updateLocation
};