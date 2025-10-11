const Listing = require('./models/listing');
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
      req.flash('error', 'You do not have permission to edit this listing');
      return res.redirect(`/listings/${id}`);
    }

    // owner verified
    return next();
  };