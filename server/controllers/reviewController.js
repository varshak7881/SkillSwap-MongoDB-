const Review = require("../models/Review");
const BarterRequest = require("../models/BarterRequest");
const User = require("../models/User");

// @route   POST /api/reviews
// Leave a review after a completed barter
const createReview = async (req, res) => {
  try {
    const { barterRequestId, rating, comment } = req.body;

    // Find the barter request
    const barter = await BarterRequest.findById(barterRequestId);
    if (!barter) {
      return res.status(404).json({ message: "Barter request not found" });
    }

    // Must be completed
    if (barter.status !== "completed") {
      return res.status(400).json({ message: "Barter must be completed first" });
    }

    // Must be sender or receiver
    const isInvolved =
      barter.from.toString() === req.user.id ||
      barter.to.toString() === req.user.id;

    if (!isInvolved) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Figure out who is being reviewed
    const reviewedUser =
      barter.from.toString() === req.user.id ? barter.to : barter.from;

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      barterRequest: barterRequestId,
      from: req.user.id
    });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Already reviewed this barter" });
    }

    // Create the review
    const review = await Review.create({
      from: req.user.id,
      to: reviewedUser,
      barterRequest: barterRequestId,
      rating,
      comment
    });

    // Recalculate the reviewed user's average rating
    const allReviews = await Review.find({ to: reviewedUser });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(reviewedUser, {
      rating: Math.round(avgRating * 10) / 10
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/reviews/:userId
// Get all reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ to: req.params.userId })
      .populate("from", "name avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/reviews/stats/:userId
// Get rating stats for a user
const getUserRatingStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { to: require("mongoose").Types.ObjectId.createFromHexString(req.params.userId) } },

      {
        $group: {
          _id: "$to",
          averageRating: { $avg: "$rating" },
          totalReviews:  { $sum: 1 },
          fiveStars:     { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStars:     { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStars:    { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStars:      { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar:       { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
        }
      },

      {
        $project: {
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          breakdown: {
            5: "$fiveStars",
            4: "$fourStars",
            3: "$threeStars",
            2: "$twoStars",
            1: "$oneStar"
          }
        }
      }
    ]);

    res.json(stats[0] || { averageRating: 0, totalReviews: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getUserReviews, getUserRatingStats };