const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');



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
app.get('/listings', async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index', {allListings });
});

//New Route
app.get('/listings/new', (req, res) => {
  res.render('listings/new');
});

//show route
app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/show', { listing });
});

//create route

app.post('/listings', wrapAsync(async(req, res, next) => {

const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})
);

//Edit route

app.get('/listings/:id/edit', async (req, res) => {
   const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit', { listing });
});

//Update route
app.put('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${listing._id}`);
});

//Delete route
app.delete('/listings/:id', async (req, res) => {
  const { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect('/listings');
});

// app.get('/testListing', async (req, res) => {
//   const sampleListing = new Listing({
//     title: 'My New Villa',
//     description: 'By the beach',
//     price: 1200,
//     location: 'Calangute, Goa',
//     country: 'India',
//   });

//   await sampleListing.save();
//   console.log('Listing saved');
//   res.send('Successful testing');
// });

app.use((err, req, res, next) => {
  res.send('Something went wrong');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
