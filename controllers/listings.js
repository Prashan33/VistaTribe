const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const { category, location, minPrice, maxPrice } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (location) filter.location = new RegExp(location, "i"); 
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = minPrice;
    if (maxPrice) filter.price.$lte = maxPrice;
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index", { allListings, category });
};



module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }
  listing.geometry = {
    type: "Point",
    coordinates: [85.324, 27.7172], // [lng, lat] — Kathmandu example
  };

  await listing.save();
  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing, mapToken: process.env.MAP_TOKEN });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
