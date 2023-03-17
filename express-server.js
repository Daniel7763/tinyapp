const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//---------FUNCTIONS----------

//generate random string function
const generateRandomString = function() {
  let chars = 'abcdefghijklmnopqrstuvwxyz123456789';
  let charLength = chars.length;
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

//add url to database function
const addUrlToDatabase = function(longUrl, shortUrl) {
  urlDatabase[shortUrl] = longUrl;
  // console.log(urlDatabase);
};

//search for email in users object
const getUserByEmail = function(emailInput) {
  for (let emailKeys in users) {
    if (emailInput === users[emailKeys].email) {
      return users[emailKeys];
    }
  }
  return null;
};

//-------------DATABASES------------

//url database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//-------------POST----------------

//Register
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const duplicateCheck = getUserByEmail(req.body.email);
  // console.log(duplicateCheck);
  // console.log(req.body);
  // console.log(email, password);
  if (!email || !password) {
    res
      .status(400)
      .send("email or password cannot be empty");
    return;
  }

  const id = generateRandomString();
  if (duplicateCheck === true) {
    res
      .status(400)
      .send("email already exists");
  }

  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect('/urls');
  console.log(users);
});

//Login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (!user) {
    return res
      .status(403)
      .send("email is not linked to an account");
  }

  if (user.password !== req.body.password) {
    return res
      .status(403)
      .send("Password is incorrect");
  }

  res.cookie("user_id", user.id);
  res.redirect('/urls');
  
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

//Delete button
app.post("/urls/:id/delete", (req, res) =>{
  const id = req.params.id;
  delete urlDatabase[id];
  // console.log("deleted URL");
  // console.log(req.params);

  res.redirect('/urls');
});

//takes input urls and adds a long $ short url to the database
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  addUrlToDatabase(longUrl, shortUrl);

  res.redirect(`/urls/${shortUrl}`);
  // res.send("Ok, we will replace this."); // Respond with 'Ok' (we will replace this)
});

//Add url to url database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.newUrl;
  urlDatabase[id] = newUrl;

  res.redirect('/urls');
//   console.log(req.body);
// res.end(JSON.stringify(req.body));
});

//------------GET---------------

//something to help add the username to index
app.get("/urls", (req, res) => {
  const cookieLogin = req.cookies["user_id"];
  const templateVars = {
    user: users[cookieLogin],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//redirects to short url website
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

//add new url Page/redirect to login if not signed in
app.get("/urls/new", (req, res) => {

  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }

  //line needed for new pages created 1/2
  const cookieLogin = req.cookies["user_id"];
  const templateVars = {

    //line needed for new pages created 2/2
    user: users[cookieLogin],
  };
  res.render("urls_new", templateVars);
});

//redirect to new page if not logged in
// app.get("/urls/new", (req, res) => {
//   if (!users[req.cookies["user_id"]]) {
//     return res.redirect("/login");
//   }
// });

//register button/redirects to urls if logged in
app.get("/register", (req, res) => {

  if (users[req.cookies["user_id"]]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

//login page/redirects to urls if logged in
app.get("/login", (req, res) => {

  if (users[req.cookies["user_id"]]) {
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
  const cookieLogin = req.cookies["user_id"];
  const templateVars = {
    user: users[cookieLogin],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.send("this url does not exist");
});


//-------------LISTEN---------------

//displays "listening on 8080 port" in terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});