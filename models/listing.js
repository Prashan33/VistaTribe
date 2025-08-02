const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  country: String,
  image: {
    url: String,
    filename: String
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  category: {
    type: String,
    enum: [
      "Mountain Villages",
      "Heritage Homes",
      "Wellness",
      "Homely Food",
      "Farm Stays",
      "Lake View",
      "Cultural Events",
      "Hiking Base",
      "Handicrafts",
      "Rustic Retreats"
    ],
    required: true
  },


  
owner: {
 type: Schema.Types.ObjectId,
 ref: "User"
},

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

// When a listing is deleted, also delete associated reviews
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
