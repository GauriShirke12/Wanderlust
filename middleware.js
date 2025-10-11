const Listing = require('./models/listing');
const { listingSchema, reviewSchema } = require('./schema');
const ExpressError = require('./utils/ExpressError');



module.exports.isLoggedIn = (req, res, next) => {

if (!req.isAuthenticated()) {
  // store the original URL the user requested so we can return after login
  req.session.redirecturl = req.originalUrl;
  req.flash('error', 'You must be logged in to create a new listing');
  // make sure session is saved before redirecting so `redirecturl` persists
  return req.session.save(() => {
    return res.redirect('/login');
  });
  }
  next();
};

  module.exports.saveredirectUrl = (req, res, next) => {
    // move the saved redirect URL from session to res.locals for this request
    if (req.session && req.session.redirecturl) {
      res.locals.redirectUrl = req.session.redirecturl;
      // remove it from session so it won't be reused accidentally
      delete req.session.redirecturl;
    }
    next();
  }; 

  module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    let listing;
    try {
      listing = await Listing.findById(id);
    } catch (err) {
      console.error('Error finding listing in isOwner middleware:', err);
    }

    // ensure listing exists
    if (!listing) {
      req.flash('error', 'This listing does not exist');
      if (req.session) {
        await new Promise((resolve) => {
          req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            resolve();
          });
        });
      }
      return res.redirect('/listings');
    }

    // ensure current user is the owner
    const currentUserId = (req.user && req.user._id) || (res.locals && res.locals.currentUser && res.locals.currentUser._id);
    if (!listing.owner || !currentUserId || !listing.owner.equals(currentUserId)) {
      req.flash('error', 'You do not have permission to this listing');
      return res.redirect(`/listings/${id}`);
    }

    // owner verified
    return next();
  };

  module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};  


module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);  
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  }
  else {    
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  try {
    const Review = require('./models/review');
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash('error', 'Review not found');
      if (req.session) await new Promise(resolve => req.session.save(() => resolve()));
      return res.redirect('back');
    }

    const currentUserId = (req.user && req.user._id) || (res.locals && res.locals.currentUser && res.locals.currentUser._id);
    if (!currentUserId || !review.author.equals(currentUserId)) {
      req.flash('error', 'You do not have permission to do that');
      return res.redirect('back');
    }
    return next();
  } catch (err) {
    console.error('Error in isReviewAuthor middleware:', err);
    req.flash('error', 'Something went wrong');
    return res.redirect('back');
  }
};