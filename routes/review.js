const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const {  reviewSchema } = require('../schema');
const Review = require('../models/review');
const Listing = require('../models/listing');


const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};  


router.post('/', validateReview, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) throw new ExpressError(404, 'Listing not found');

  const newReview = new Review(req.body.review);

  await newReview.save();
  listing.reviews.push(newReview._id);
  await listing.save();

    req.flash('success', 'Review added successfully!');
    // Ensure session is saved before redirect so flash isn't lost
    if (req.session) {
      req.session.save(err => {
        if (err) console.error('Session save error:', err);
        res.redirect(`/listings/${listing._id}`);
      });
    } else {
      res.redirect(`/listings/${listing._id}`);
    }
}));

//Delete Route for reviews
router.delete('/:reviewId', wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Review deleted successfully!');
    // Ensure session is saved before redirect so flash isn't lost
    if (req.session) {
      req.session.save(err => {
        if (err) console.error('Session save error:', err);
        res.redirect(`/listings/${id}`);
      });
    } else {
      res.redirect(`/listings/${id}`);
    }
}));

module.exports = router;