if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");
const { listingSchema, reviewSchema } = require("./schema.js");
const session = require("express-session");
const MongoStore =  require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

 
const User = require("./models/user"); 


// Import routes
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");
const apiRoutes = require("./routes/api");
const app = express();



const dbUrl = process.env.ATLASDB_URL;
mongoose.connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiRoutes);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET, 
  },
  touchAfter: 24 * 3600 ,
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR ", e);
});

const sessionOptions = {
  store,
  secret:  process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 *1000,
    maxAge: 7 * 24 * 60 * 60 *1000,
    httpOnly: true,
 
  },
};



store.on("error", function (e) {
  console.log("SESSION STORE ERROR ❌", e);
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.currentUser = req.user;        
  res.locals.success = req.flash("success");  
  res.locals.error = req.flash("error");
  next();
});

// Mount Routes
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);



// 404 route
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Error ${statusCode}</h1>
        <p>${message}</p>
        <a href="/listings">Go back to listings</a>
      </body>
    </html>
  `);
});



app.listen(8080, () => {
  console.log("🚀 Server running at http://localhost:8080");
});
