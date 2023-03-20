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
const addUrlToDatabase = function(longUrl, shortUrl, userID) {
  //--url update--
  // urlDatabase[shortUrl] = longUrl;
  urlDatabase[shortUrl] = {longUrl, userID};
  console.log(urlDatabase);
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

//-------------POST----------------

//Register
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const duplicateCheck = getUserByEmail(req.body.email);

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
  const userCookie = req.cookies["user_id"];
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
//   const id = req.params.id;
//   delete urlDatabase[id];
//   res.redirect('/urls');
// });

//takes input urls and adds a long $ short url to the database
app.post("/urls", (req, res) => {
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();

  if (!req.cookies['user_id']) {
    return res.send('please login');
  }

  addUrlToDatabase(longUrl, shortUrl, req.cookies["user_id"]);

  return res.redirect(`/urls/${shortUrl}`);
  // res.send("Ok, we will replace this."); // Respond with 'Ok' (we will replace this)
});

//shorturl display/ undefined url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.newUrl;
  urlDatabase[id] = newUrl;
  const userCookie = req.cookies.users_id;

  //--show message if click edit on _index and shorturl not in users object--

  //--bug start. found that causes a non login issue--
  // if (urlDatabase[id].user_id !== req.cookies.users_id) {
  //   return res
  //     .status(400)
  //     .send('Please <a href="/login">login</a> to view your short URLs');
  // }

  //--login request message if click edit on _index while logged out--
  if (!userCookie) {
    return res.redirect("urls_login");
  }
  //bug end.

  //--if user in database--
  if (!urlDatabase[req.params.id]) {
    return res
      .status(400)
      .send("url not in database");
  }
  //--if shorturl isnt in your user object show warning--
  if (urlDatabase[req.params.id].userID !== req.user_id) {
    return res
      .status(400)
      .send('You lack permission to see this url.');
  }

  res.redirect('/urls');
});

//------------GET---------------

//something to help add the username to index
app.get("/urls", (req, res) => {
  console.log(urlDatabase, "urlDatabase");

  const cookieLogin = req.cookies["user_id"];
  const templateVars = {
    user: users[cookieLogin],
    urls: urlsForUser(req.cookies["user_id"], urlDatabase)
  };
  // hide short urls /display message if not signed in
  // if (!req.cookies["user_id"]) {
  //   return res.send("please login or register to start making short Urls");

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
  };
  //--no user logged in/ redirect to login--
  if (!cookieLogin) {
    return res. redirect("/login");
  }

  //--url does not exist/ send error message
  if (!urlDatabase[req.params.id]) {
    console.log(req.params.id);
    return res
      .status(400)
      .send("url does not exist");
  }

  //--if cookie does not match logged in user/ send to login--
  if (urlDatabase[req.params.id].userID !== cookieLogin) {
    console.log(`${urlDatabase[req.params.id].userID}, req. params`);
    console.log(`${cookieLogin}, cookielogin`);
    return res.send("access to this url is blocked");
  }
  return res.render("urls_show", templateVars);
});


//-------------LISTEN---------------

//displays "listening on 8080 port" in terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});