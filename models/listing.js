const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const { urlencoded } = require('express');

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review',  
  },
],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

});


listingSchema.post('findOneAndDelete', async function(listing) {
  if (!listing) return;
  try {
    if (Array.isArray(listing.reviews) && listing.reviews.length) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
  } catch (err) {
    // Log the error instead of throwing to avoid crashing the server
    console.error('Error deleting reviews for listing', listing._id, err);
  }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
