const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Listing = require('../models/listing');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// Debug: indicate this routes file was loaded
console.log('routes/review.js loaded');


//Post Route for reviews
// Router is mounted at /listings/:id/reviews, so use POST '/' here
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  // Debug logging to help trace form submissions
  console.log('reviews POST handler invoked', { method: req.method, originalUrl: req.originalUrl, params: req.params });
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) throw new ExpressError(404, 'Listing not found');

  const newReview = new Review(req.body.review);
  // attach current user as author
  if (req.user && req.user._id) {
    newReview.author = req.user._id;
  }

  await newReview.save();
  listing.reviews.push(newReview._id);
  await listing.save();

    req.flash('success', 'Review added successfully!');
    if (req.session) {
      req.session.save(err => {
        if (err) console.error('Session save error:', err);
        res.redirect(`/listings/${listing._id}`);
      });
    } else {
      res.redirect(`/listings/${listing._id}`);
    }
}));

// Debug route to verify router mounting
router.get('/_ping', (req, res) => {
  res.json({ ok: true, params: req.params });
});

//Delete Route for reviews - only the review author can delete
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  // pull review from listing and delete the review
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