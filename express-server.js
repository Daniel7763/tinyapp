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

//---------FUNCTIONS----------

//get users account object by searching for email
const getUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return null;
};

//filter database for a specific users url's
const urlsForUser = (id, urlDatabase) => {
  let userURLdata = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLdata[url] = urlDatabase[url];
    }
  }
  return userURLdata;
};

//Add url to database function
const addUrlToDatabase = function(longUrl, shortUrl, userID) {
  //--url update--
  // urlDatabase[shortUrl] = longUrl;
  urlDatabase[shortUrl] = {longUrl, userID};
};

//Generate random string function
const generateRandomString = function() {
  let chars = 'abcdefghijklmnopqrstuvwxyz123456789';
  let charLength = chars.length;
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

// const {
//   getUserByEmail,
//   urlsForUser,
//   addUrlToDatabase,
//   generateRandomString,
// } = require("./helpers.js");

//-------------DATABASES------------

//url database object
const urlDatabase = {
  b2xVn2: {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  '9sm5xK': {
    longUrl: "http://www.google.com",
    userID: "aJ48lW",
  },
};

//users account object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//exported for function use in helpers
module.exports = { urlDatabase, users };

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
  // if (user.password !== req.body.password) {
  //   return res
  //     .status(403)
  //     .send("Password is incorrect");
  // }
  //--store hashed passwords with bcrypt--
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res
      .status(400)
      .send("password is incorrect");
  }
  //added session
  // res.cookie("user_id", user.id);
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//LOGOUT
app.post("/logout", (req, res) => {
  // res.clearCookie(req.session.user_id);
  req.session.user_id = null;
  res.redirect('/login');
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
  return res.redirect(`/urls/${shortUrl}`);
  // res.send("Ok, we will replace this."); // Respond with 'Ok' (we will replace this)
});

//shorturl display/ undefined url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  console.log(id, "--id");
  const userCookie = req.session.user_id;
  //--login request message if click edit on _index while logged out--
  if (!userCookie) {
    console.log("going from mystery page to login");
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
  //add session
  //const cookieLogin = req.cookies["user_id"];
  const cookieLogin = req.session.user_id;
  const templateVars = {
    //add session
    // urls: urlsForUser(req.cookies["user_id"], urlDatabase)
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[cookieLogin],
  };
  res.render("urls_index", templateVars);
});

//redirects to short url website
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  //--url update--
  // const longURL = urlDatabase[id];
  const longURL = urlDatabase[id].longUrl;
  res.redirect(longURL);
});

//New url Page/redirect to login if not signed in
app.get("/urls/new", (req, res) => {
  //add session
  //if (!users[req.cookies["user_id"]]) {
  if (!users[req.session.user_id]) {
    console.log(req.session.user_id);
    console.log('going from new to login');
    return res.status(400).send("user does not match session id");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

//register button/redirects to urls if logged in
app.get("/register", (req, res) => {
  //add session
  // if (users[req.cookies["user_id"]]) {
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
  //add session
  //if (users[req.cookies["user_id"]]) {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  console.log("user logged out");
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
    // console.log(req.params.id);
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


//-------------LISTEN---------------

//displays "listening on 8080 port" in terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});