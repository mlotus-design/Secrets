require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require('https');
const ejs = require('ejs');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//Create session
app.use(session({
  secret: 'My little secret code',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

// initalize passport for authentication
app.use(passport.initialize());
app.use(passport.session());

//Connect to database
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  if(req.isAuthenticated()){
    // console.log("User is authenticated");
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res) {

  User.register({username:req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      // console.log("Successfully authenticated");
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
   }
});
});


app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
       console.log(err);
     } else {
       passport.authenticate("local")(req, res, function(){
         res.redirect("/secrets");
       });
     }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started - listening on port 3000");
});
