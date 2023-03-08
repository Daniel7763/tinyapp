const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

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
  res.render("urls_new");
});

//?? not sure what this one is supposed to do
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

//My URLs, Homepage
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//displays a=1
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

//displays in terminal server listening on which port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});