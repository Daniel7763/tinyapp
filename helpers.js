
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

//-------------DATABASES------------

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

//---------EXPORT----------

module.exports = {
  getUserByEmail,
  urlsForUser,
  addUrlToDatabase,
  generateRandomString,
  users,
  urlDatabase,
};