const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");


const Listing = require("./models/listing.js");
const Review = require("./models/review");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.originalUrl.includes("/reviews")) {
      const listingId = req.originalUrl.split("/")[2];
      req.session.returnTo = `/listings/${listingId}`;
    } else {
      req.session.returnTo = req.originalUrl;
    }
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

const saveRedirectUrl = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.redirectUrl = req.session.returnTo;
  }
  next();
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};

module.exports = {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  isReviewAuthor,
  validateListing,
};
