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



const sessionOptions = {
  secret: 'mysupersecretcode',   
  resave: false,
  saveUninitialized: true,
  cookie : {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
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
      if (req.session && req.session.flash) {
        console.log('session.flash before consuming:', JSON.stringify(req.session.flash));
      }
    } catch (e) {
      // ignore logging errors
    }

    // Move flash messages into res.locals so templates can render them
    res.locals.success = req.flash('success');
    // Provide `error` too so templates can safely reference it
    res.locals.error = req.flash('error');
    console.log('res.locals.success after consuming flash:', res.locals.success);
    next();
  });

const listings = require('./routes/listing');
const reviews = require('./routes/review');


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


app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);


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
