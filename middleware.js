
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
    // continue the middleware chain
    next();
  }; 