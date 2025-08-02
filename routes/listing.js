const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router
  .route("/")
  .get(wrapAsync(listings.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listings.createListing)
  );


router.get("/new", isLoggedIn, listings.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listings.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), 
    validateListing,
    wrapAsync(listings.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listings.deleteListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listings.renderEditForm));

module.exports = router;