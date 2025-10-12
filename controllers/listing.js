const Listing = require('../models/listing');       


module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  console.log('index: found', allListings.length, 'listings');
  res.render('listings/index', { allListings });
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
  res.render('listings/show', { listing });
};


module.exports.createListing=async(req, res, next) => {

  const url= req.file.path;
  const filename= req.file.filename;
  newListing.image={url, filename};
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
  res.render('listings/edit', { listing });
};


module.exports.updateListing= async (req, res) => {

  const { id } = req.params;
  const listingData = { ...req.body.listing };
 if(typeof req.file !== 'undefined'){
  const url= req.file.path;
  const filename= req.file.filename;
 listingData.image={url, filename};
 await listingData.save();

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
};