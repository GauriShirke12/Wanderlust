if(process.env.NODE_ENV !== 'production'){
require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const listingRouter = require('./routes/listing');
const reviewsRouter = require('./routes/review'); 
const userRouter =require('./routes/user');



const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'mysupersecretcode',
  resave: false,
  saveUninitialized: true,
  cookie : {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week (Date object)
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};


  app.use(session(sessionOptions));
  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());


  app.use((req, res, next) => {
    // Log any flash messages currently stored in the session (non-consuming)
    try {
      if (process.env.NODE_ENV === 'development') {
        if (req.session && req.session.flash) {
          console.log('session.flash before consuming:', JSON.stringify(req.session.flash));
        }
      }
    } catch (e) { 
    }



    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    if (process.env.NODE_ENV === 'development') {
      console.log('res.locals.success after consuming flash:', res.locals.success);
    }
    res.locals.currentUser = req.user;
    next();
  });

const listings = require('./routes/listing');
const reviews = require('./routes/review');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wanderlust';

const PORT = process.env.PORT || 8000;

async function main() {
  await mongoose.connect(MONGODB_URI);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hi, I am root');
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewsRouter);

// Debug middleware: log incoming requests (temporary)
app.use((req, res, next) => {
  try {
    console.log('INCOMING REQUEST ->', req.method, req.originalUrl);
  } catch (e) {
    // ignore logging errors
  }
  next();
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/', userRouter);


app.use((req, res, next) => { 
  next(new ExpressError(404, 'Page Not Found')); 
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'Something went wrong' } = err;
 res.status(statusCode).render("listings/error", { message });

 
});

// Connect to DB and start server after all middleware and routes are registered
main()
  .then(() => {
    console.log('Connected to DB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
  });
