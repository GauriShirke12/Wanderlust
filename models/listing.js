const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: 'listingimage',
    },
    url: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=1196&auto=format&fit=crop&ixlib=rb-4.1.0',
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review',  
  }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
