const Listing = require('../models/listing');       

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports.index=async (req, res) => {
  const rawSearch = req.query.search || '';
  const searchTerm = rawSearch.trim();
  let query = {};

  if (searchTerm) {
    const safePattern = new RegExp(escapeRegExp(searchTerm), 'i');
    query = {
      $or: [
        { country: safePattern },
        { location: safePattern },
        { title: safePattern },
      ],
    };
  }

  const allListings = await Listing.find(query);
  console.log('index: search "%s" found', searchTerm || 'all', allListings.length, 'listings');
  res.render('listings/index', { allListings, searchTerm });
}


module.exports.renderNewForm=(req, res) => {
  res.render('listings/new');
}

module.exports.showListing=async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('owner');
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
  // Ensure we always have an image.url for the view (defensive fallback)
  if (!listing.image || !listing.image.url) {
    listing.image = listing.image || {};
    listing.image.url = 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=1196&auto=format&fit=crop&ixlib=rb-4.1.0';
    console.log('showListing: applied fallback image URL for listing', id);
  }
  const googleMapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_MAP_API_KEY ||
    process.env.GMAPS_API_KEY ||
    process.env.CLOUD_API_KEY ||
    '';
  res.render('listings/show', { listing, googleMapsApiKey });
};


module.exports.createListing=async(req, res, next) => {

  // Convert image string to object for Mongoose
  const listingData = { ...req.body.listing };
  console.log('createListing: raw listingData:', listingData);
  if (typeof listingData.image === 'string') {
    listingData.image = { url: listingData.image };
  }
  // If no image provided, ensure image object exists so templates can safely access image.url
  if (!listingData.image || !listingData.image.url) {
    listingData.image = listingData.image || {};
    // Use the model's default Unsplash image when user doesn't provide a URL
    listingData.image.url = 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=1196&auto=format&fit=crop&ixlib=rb-4.1.0';
  }
  // If a file was uploaded by multer, attach its path/filename to the data
  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    listingData.image = { url, filename };
  }

  const newListing = new Listing(listingData);
  console.log('createListing: newListing before save:', newListing);
  // attach the currently authenticated user as the owner
  if (req.user && req.user._id) {
    newListing.owner = req.user._id;
  }
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect('/listings');
};


module.exports.renderEditForm = async (req, res) => {
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

  let originalImageUrl = listing.image.url;
  // create a smaller thumbnail variant for the edit form
  if (originalImageUrl && typeof originalImageUrl === 'string') {
    // replace returns a new string so reassign; ensure there's a trailing slash after the transformation
    originalImageUrl = originalImageUrl.replace('/upload/', '/upload/w_250/');
  } else {
    // provide a small fallback image
    originalImageUrl = 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=250&auto=format&fit=crop&ixlib=rb-4.1.0';
  }
  res.render('listings/edit', { listing, originalImageUrl });
};


module.exports.updateListing= async (req, res) => {

  const { id } = req.params;
  const listingData = { ...req.body.listing };
 if(typeof req.file !== 'undefined'){
  const url= req.file.path;
  const filename= req.file.filename;
 listingData.image={url, filename};

 }
  
  if (typeof listingData.image === 'string') {
    listingData.image = { url: listingData.image };
  }
  // Ensure image object exists after update; if user removed image, set placeholder
  if (!listingData.image || !listingData.image.url) {
    listingData.image = listingData.image || {};
    listingData.image.url = 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=1196&auto=format&fit=crop&ixlib=rb-4.1.0';
  }

  const updatedListing = await Listing.findByIdAndUpdate(id, listingData, { new: true, runValidators: true });

  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${updatedListing._id}`);
};


module.exports.deleteListing=async (req, res) => {
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
}:
