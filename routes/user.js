const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveredirectUrl } = require('../middleware');

router.get('/signup', (req, res) => {
  res.render('users/signup');
});

router.post('/signup', wrapAsync(async (req, res) => {
    try {
    const { username, email, password } = req.body; 
    // Prevent duplicate registration by username or email
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      req.flash('error', 'A user with that email or username is already registered.');
      return res.redirect('/signup');
    }
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    

    // Log the user in immediately after successful registration
    req.login(registeredUser, (err) => {
      if (err) {
        req.flash('error', 'Registration succeeded but automatic login failed. Please login manually.');
        return res.redirect('/login');
      }
      req.flash('success', 'Welcome to Wanderlust!');
      return res.redirect('/listings');
    });
    } catch (e) {
      // Passport-local-mongoose and mongoose errors will be surfaced here
      req.flash('error', e.message);
      res.redirect('/signup');
    }
  }));

  router.get('/login', (req, res) => {
    res.render('users/login');
  });

  // Use explicit callback to ensure we can save session and control redirect/flash
  router.post(
    '/login',
    saveredirectUrl,
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login'
    }),
    async (req, res) => {
      // Flash success and redirect to the originally requested URL if present
      req.flash('success', 'Welcome back!');

      // Prefer the redirect URL moved into res.locals by the saveredirectUrl middleware,
      // but also check the session directly in case of timing differences.
      let redirectUrl = res.locals.redirectUrl || (req.session && req.session.redirecturl) || '/listings';

      // Ensure the session (with flash and cleared redirecturl) is saved before redirecting
      if (req.session) {
        return req.session.save((err) => {
          if (err) {
            console.error('Session save error after login:', err);
          }
          return res.redirect(redirectUrl);
        });
      }
      return res.redirect(redirectUrl);
    }
  );

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }  
      req.flash('success', 'You are logged out!');
      res.redirect('/listings');
    });
  });

module.exports = router;