const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getUserProfile,
  updateProfile,
  addTeachSkill,
  removeTeachSkill,
  addLearnSkill,
  removeLearnSkill,
  getMatchedUsers,
  updateLocation
} = require("../controllers/userController");

router.get("/match",                    protect, getMatchedUsers);
router.get("/:id",                      getUserProfile);
router.put("/profile",                  protect, updateProfile);
router.put("/location",                 protect, updateLocation);
router.post("/teach-skills",            protect, addTeachSkill);
router.delete("/teach-skills/:skillId", protect, removeTeachSkill);
router.post("/learn-skills",            protect, addLearnSkill);
router.delete("/learn-skills/:skillId", protect, removeLearnSkill);

module.exports = router;