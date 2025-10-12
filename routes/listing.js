const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const { isLoggedIn, isOwner , validateListing} = require('../middleware');
const listingController = require('../controllers/listing');
const multer  = require('multer')
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

router
.route('/')
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, validateListing, upload.single('listing[image][url]'), wrapAsync(listingController.createListing));

  //New router
router.get('/new', isLoggedIn, listingController.renderNewForm);

router.route('/:id')
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


//Edit router

router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));
module.exports = router;