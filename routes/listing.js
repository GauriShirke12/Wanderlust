const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const { listingSchema , reviewSchema } = require('../schema');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');


const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};  



//Index
router.get('/', wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index', {allListings });
}));

//New router
router.get('/new', isLoggedIn, wrapAsync((req, res) => {
  res.render('listings/new');
}));

//show router
router.get('/:id', wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  if (!listing) {
    // listing was not found (maybe deleted) — flash an error and redirect to index
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

  res.render('listings/show', { listing });
}));


//create router

router.post('/', isLoggedIn, validateListing, wrapAsync(async(req, res, next) => {
  
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect('/listings');
}));

//Edit router

router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
   const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'This listing does not exist');
    if (req.session) {
      await new Promise((resolve) => {
        req.session.save(() => resolve());
      });
    }
    return res.redirect('/listings');
  }
  res.render('listings/edit', { listing });
}));

//Update router
router.put('/:id', isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  // return the updated document and run schema validators
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });
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

  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${listing._id}`);
}));

//Delete router
router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash('success', 'Successfully deleted the listing!');
  if (req.session) {
    await new Promise((resolve) => {
      req.session.save(() => resolve());
    });
  }
  res.redirect('/listings');
}));

module.exports = router;