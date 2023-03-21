const { urlDatabase, users } = require("./express-server");

//get users account object by searching for email
const getUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (email === users[email].email) {
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

module.exports = {
  getUserByEmail,
  urlsForUser,
  addUrlToDatabase,
  generateRandomString,
};