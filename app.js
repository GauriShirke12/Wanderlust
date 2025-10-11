const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema , reviewSchema } = require('./schema');
const Review = require('./models/review');




const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};  


const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};  




const MONGODB_URI = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGODB_URI); 
}



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 8000;
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hi, I am root');
});

//Index Route
app.get('/listings', wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index', {allListings });
}));

//New Route
app.get('/listings/new', wrapAsync((req, res) => {
  res.render('listings/new');
}));

//show route
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  if (!listing) return next(new ExpressError(404, 'Listing not found'));
  res.render('listings/show', { listing });
}));


//create route

app.post('/listings', validateListing, wrapAsync(async(req, res, next) => {
  
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect('/listings');
}));

//Edit route

app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
   const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit', { listing });
}));

//Update route
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  // return the updated document and run schema validators
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });
  res.redirect(`/listings/${listing._id}`);
}));

//Delete route
app.delete('/listings/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect('/listings');
}));

//Reviews
//Post Route for reviews


app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) throw new ExpressError(404, 'Listing not found');

  const newReview = new Review(req.body.review);

  await newReview.save();
  listing.reviews.push(newReview._id);
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

//Delete Route for reviews
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);


  res.redirect(`/listings/${id}`);
}));

// Fallback for unmatched routes - use app.use instead of app.all('*', ...) 
app.use((req, res, next) => { 
  next(new ExpressError(404, 'Page Not Found')); 
});


// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'Something went wrong' } = err;
 res.status(statusCode).render("listings/error", { message });

  // res.status(statusCode).send(message);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
