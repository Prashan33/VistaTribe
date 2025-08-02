// routes/api.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

router.get("/listings/geojson", async (req, res) => {
  const listings = await Listing.find({});
  const features = listings.map(listing => ({
    type: "Feature",
    geometry: listing.geometry,
    properties: {
      title: listing.title,
      id: listing._id,
    },
  }));

  res.json({
    type: "FeatureCollection",
    features: features,
  });
});

module.exports = router;
