const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

const generateRandomString = function() {
  let chars = 'abcdefghijklmnopqrstuvwxyz123456789';
  let charLength = chars.length;
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const addUrlToDatabase = function(longUrl, shortUrl) {
  urlDatabase[shortUrl] = longUrl;
  console.log(urlDatabase);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// addUrlToDatabase(urlDatabase, "https://hoyt.com/", "xbjj76");


// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.use(express.urlencoded({ extended: true }));

//register
app.post("/register", (req, res) => {
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.render("urls_register");

});

//login
app.post("/login", (req, res) => {
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

//something to help add the username to index
app.get("/urls", (req, res) => {
  console.log(req.cookies);
  const templateVars = {
    username: req.cookies["username"],
    urls:urlDatabase
  };
  res.render("urls_index", templateVars);
});

//delete button
app.post("/urls/:id/delete", (req, res) =>{
  const id = req.params.id;
  delete urlDatabase[id];
  console.log("deleted URL");
  console.log(req.params);

  res.redirect('/urls');
});


//takes input urls and adds a long $ short url to the database
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  addUrlToDatabase(longUrl, shortUrl);

  res.redirect(`/urls/${shortUrl}`);
  // res.send("Ok, we will replace this."); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);

});

//create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

//?? not sure what this one is supposed to do
//templatevars purpose is using ejs to pass in data from the server end to the client side
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//edit url page
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.newUrl;
  urlDatabase[id] = newUrl;

  res.redirect('/urls');
//   console.log(req.body);
// res.end(JSON.stringify(req.body));
});
 

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//displays in terminal server listening on which port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});