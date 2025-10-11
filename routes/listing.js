const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const { listingSchema , reviewSchema } = require('../schema');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isOwner } = require('../middleware');


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
  const listing = await Listing.findById(id).populate('reviews').populate('owner');
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
console.log(listing);
  res.render('listings/show', { listing });
}));


//create router

router.post('/', isLoggedIn, validateListing, wrapAsync(async(req, res, next) => {
  // Convert image string to object for Mongoose
  const listingData = { ...req.body.listing };
  if (typeof listingData.image === 'string') {
    listingData.image = { url: listingData.image };
  }
  const newListing = new Listing(listingData);
  // attach the currently authenticated user as the owner
  if (req.user && req.user._id) {
    newListing.owner = req.user._id;
  }
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect('/listings');
}));

//Edit router

router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
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
router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {

  const { id } = req.params;
  const listingData = { ...req.body.listing };
  if (typeof listingData.image === 'string') {
    listingData.image = { url: listingData.image };
  }

  const updatedListing = await Listing.findByIdAndUpdate(id, listingData, { new: true, runValidators: true });

  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${updatedListing._id}`);
}));

//Delete router
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
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