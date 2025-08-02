const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/review");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

router
  .route("/")
  .post(isLoggedIn, wrapAsync(reviews.createReview));

router
  .route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;