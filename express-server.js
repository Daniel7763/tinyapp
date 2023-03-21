const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["secret"],
}));

//---------FUNCTIONS & DATABASES----------

const {
  getUserByEmail,
  urlsForUser,
  // addUrlToDatabase,
  generateRandomString,
  users,
  urlDatabase,
} = require("./helpers.js");

// Add url to database function
const addUrlToDatabase = function(longUrl, shortUrl, userID) {
  urlDatabase[shortUrl] = {longUrl, userID};
};

//-------------POST----------------

//REGISTER
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const duplicateEmail = getUserByEmail(req.body.email, users);
  //--check for empty fields--
  if (!email || !password) {
    return res
      .status(400)
      .send("email or password cannot be empty");
  }
  //--check for duplicate emails--
  if (duplicateEmail) {
    return res
      .status(400)
      .send("email already exists");
  }
  //--new user object--
  users[id] = {
    id:id,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = id;
  res.redirect('/urls');
  return;
});

//LOGIN
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res
      .status(403)
      .send("email is not linked to an account");
  }
  //--store hashed passwords with bcrypt--
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res
      .status(400)
      .send("password is incorrect");
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
  return;
});

//DELETE BUTTON
app.post("/urls/:id/delete", (req, res) =>{
  const userCookie = req.session.user_id;
  if (!userCookie) {
    return res
      .status(400)
      .send('Need to be logged in to delete urls');
  } else {
    const userURLs = urlsForUser(userCookie, urlDatabase);
    const urlToDelete = req.params.id;
    if (userURLs[urlToDelete]) {
      delete urlDatabase[urlToDelete];
      res.redirect('/urls');
    } else {
      return res
        .status(400)
        .send('only the creator of a url can delete ');
    }
  }
});

//takes input urls and adds a long $ short url to the database
app.post("/urls", (req, res) => {
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  if (!req.session.user_id) {
    return res.send('please login');
  }
  addUrlToDatabase(longUrl, shortUrl, req.session.user_id);
  return res.redirect(`/urls`);
});

//shorturl display/ undefined url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userCookie = req.session.user_id;
  //--login request message if click edit on _index while logged out--
  if (!userCookie) {
    return res.redirect("urls_login");
  }
  //--if user in database--
  if (!urlDatabase[id]) {
    return res
      .status(400)
      .send("url not in database");
  }
  //--if shorturl isnt in your user object show warning--
  if (urlDatabase[id].userID !== userCookie) {
    return res
      .status(400)
      .send('You lack permission to see this url.');
  }
  const newUrl = req.body.newUrl;
  urlDatabase[id] = {
    longUrl: newUrl,
    userID: userCookie
  };
  res.redirect('/urls');
});

//------------GET---------------

//something to help add the username to index
app.get("/urls", (req, res) => {
  const cookieLogin = req.session.user_id;
  if (!users[req.session.user_id]) {
    return res.status(400).send('Please <a href="/login">login</a> to view your URLs');
  }
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[cookieLogin],
  };
  return res.render("urls_index", templateVars);
});

//redirects to short url website
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longUrl;
  res.redirect(longURL);
});

//New url Page/redirect to login if not signed in
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.status(400).send('Please <a href="/login">login</a> to create a new URL');
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

//register button/redirects to urls if logged in
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

//login page/redirects to urls if logged in
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("urls_login", templateVars);
});

//undefined page
app.get("/urls/:id", (req, res) => {
  const cookieLogin = req.session.user_id;
  //--no user logged in/ redirect to login--
  if (!cookieLogin) {
    return res. redirect("/login");
  }
  //--url does not exist/ send error message--
  if (!urlDatabase[req.params.id]) {
    return res
      .status(400)
      .send("url does not exist");
  }
  //--if cookie does not match logged in user/ send to login--
  if (urlDatabase[req.params.id].userID !== cookieLogin) {
    return res
      .status(403)
      .send("access to this url is blocked");
  }
  const templateVars = {
    user: users[cookieLogin],
    id: req.params.id,
    longUrl: urlDatabase[req.params.id].longUrl,
  };
  return res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//-------------LISTEN---------------

//displays "listening on 8080 port" in terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});