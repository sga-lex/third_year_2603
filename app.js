//jshint esversion:6
require('dotenv').config();
var md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
////////////////////////////////////////
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const encrypt = require("mongoose-encryption");
// const { MongoClient } = require("mongodb");
const UserDetails = require('./userschema.js');
const ProjectDetails = require('./projectschema.js');
const TicketDetails = require('./ticketschema.js');
const TicketArchive = require('./ticketarchiveschema.js');
////////////// connection to mongoDB Atlas using mongoose ///////////////////////////
const dbURI = 'mongodb+srv://Lex_x:Tofiluk143@projectmanagement.aexnu2c.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB Atlas');
});
////////////// connection to mongoDB Atlas using mongoose ///////////////////////////
const startingContent = "Welcome to the home page! This is the page where you tem members can create new projects, look through the list of existing projects and read into more detail, as well as track their progress by interacting wtih the leaderboard and viewing their own score.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const aboutContent = "Hi";
const defaultTitle = "Display your projects!";
const defaultDescription = "Each project displayed ...";

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res){
  UserDetails.findOne({ email: req.body.email, password: req.body.password }).then((user) => {
    if(user){
      res.redirect('/main');
    } else{
      return res.status(400).json({ email: "there is no account with this email"});
      // res.redirect('/register');
    }
  });
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){

  UserDetails.findOne({ email: req.body.email }).then((user) => {
    if(user){
      // return res.status(400).json({ email: "account had already been made with this email"});
      res.redirect('/login');
    } else{
      const newUser = new UserDetails({ name: req.body.full_name, email: req.body.email, password: req.body.password });
      newUser.save();
      res.redirect('/login');
    }
  });
});

app.get("/main", function(req, res){

  ProjectDetails.find({}, function(err, posts) {
        res.render('main', { startingContent: startingContent, posts: posts });
  });
});

app.post("/main", function(req, res){

  const post = new ProjectDetails({ title: req.body.postTitle, content: req.body.postBody });
  post.save(function(err){
    if (!err){
     // res.redirect("/main");
     console.log(err);
   }else{
     redirect('main.ejs');
   }
 });
  // res.redirect('/main');
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

function getUsers(req, res, next) {
   // Code here
   UserDetails.find({}, function (err, users) {
     if (err) next(err);
     res.locals.savedUsers = users;
     next();
   });
};
function getProjects(req, res, next) {
   ProjectDetails.find({}, function (err, projects) {
     if (err) next(err);
     res.locals.savedProjects = projects;
     next();
   });
};
function renderForm(req, res) {
    res.render("compose");
};

app.get("/compose", getUsers, getProjects, renderForm);

app.post("/compose", function(req, res){
  const newTicket = new TicketDetails({ title: req.body.ticketTitle, description: req.body.ticketBody, project: req.body.project, assignedTo: req.body.assignedTo, urgency: req.body.ticketUrgency });
  const ticketArchive = new TicketArchive({ title: req.body.ticketTitle, description: req.body.ticketBody, project: req.body.project, assignedTo: req.body.assignedTo, urgency: req.body.ticketUrgency });
  newTicket.save();
  ticketArchive.save();
  res.redirect("/about");
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;
  ProjectDetails.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", { title: post.title, content: post.content });
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
