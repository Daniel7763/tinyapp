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

//emailSearch function
const emailSearch = function(input) {
  for (let emailKeys in users) {
    console.log(emailKeys, " - emailKeys");
    console.log(input, " - input");
    if (input === users[emailKeys].email) {
      return true;
    }
  }
  return false;
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

//register
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const duplicateCheck = emailSearch(req.body.email);
  console.log(duplicateCheck);
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
    id, email, password
  };
  res.cookie("user_id", id);
  // res.send("welcome to the register page");
  // console.log(req.body.email);
  // res.cookie("email", req.body.email);
  
  res.redirect('/urls');
});

//login
app.post("/login", (req, res) => {
  // console.log(req.body.username);
  // res.cookie("username", req.body.username);
  res.cookie("password", req.body.password);
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

//delete button
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

//add url to url database
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
  users[cookieLogin];
  // console.log(users);
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

//add new url Page
app.get("/urls/new", (req, res) => {

  //line needed for new pages created 1/2
  const cookieLogin = req.cookies["user_id"];
  const templateVars = {

    //line needed for new pages created 2/2
    user: users[cookieLogin],
  };
  res.render("urls_new", templateVars);
});

//edit url button
app.get("/urls/:id", (req, res) => {
  const cookieLogin = req.cookies["user_id"];
  const templateVars = {
    user: users[cookieLogin],
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//-------------LISTEN---------------

//displays "listening on 8080 port" in terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});