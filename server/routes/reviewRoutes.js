const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createReview,
  getUserReviews,
  getUserRatingStats
} = require("../controllers/reviewController");

router.post("/",              protect, createReview);
router.get("/:userId",        getUserReviews);
router.get("/stats/:userId",  getUserRatingStats);

module.exports = router;