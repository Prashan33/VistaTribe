const Joi = require('joi');
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    category: Joi.string().valid(
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
    ).required()
  }).required().unknown(true)
});




module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5).required(),
    content: Joi.string().required()
  }).required()
});
     