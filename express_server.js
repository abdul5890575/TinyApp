const express = require("express");
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Asm5xK": "http://www.google.com"
};

let users = { };
let user=FindUserObject()


//------------------------Helper Functions------------------------------//

function generateRandomString() {
  let result = '';
  let randomarray = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  for (let i = 0; i < 6; i++) {
    let indNum = Math.floor(Math.random() * (26 - 0) + 0);
    result += randomarray[indNum];
  }
  return result;
}

function FindUserObject(cookie_id) {
  let userSignedInObject;
  for (let id in users) {
    if( cookie_id === id) {
      userSignedInObject = users[id]
    }
  }
  return userSignedInObject;
}

function CheckDatabaseForEmails(email) {
  let array=Object.values(users)
  
  for (let i = 0 ; i < array.length; i++){
    if (array[i]['email'] === email){
      return true;
    }
  }
  return false;
}


// ------------------- Authentication---------------------------//
app.post("/login", (req, res) => {
  res.cookie('username', req.body['username'])
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let user = FindUserObject(req.cookies.user_id)
  const templateVars = { urls: urlDatabase,
                         username: user }
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let idstring = generateRandomString();
  let innerObject = { id : idstring, email : req.body.email, password : req.body.password}
  if (req.body.email === '' || req.body.password === '' ) {
    res.status(404).send('Error: 404 Email or Password empty')
  } else if(CheckDatabaseForEmails(req.body.email)) {
    res.status(400).send('Error: 400 Email already exists')
  }else {
    users[idstring] = innerObject;
    res.cookie('user_id', idstring)
    // res.cookie('email',req.body.email)
    res.redirect('/urls')
  }
});

//--------------------------------------------------------------//
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let user = FindUserObject(req.cookies.user_id)
  console.log('Cookies: ', req.cookies)
  const templateVars = { urls: urlDatabase,
                         username: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user = FindUserObject(req.cookies.user_id)
  const templateVars = { username: user};
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  let ShortURL = generateRandomString();
  urlDatabase[ShortURL] = 'http://'+req.body.longURL;
  res.redirect(`/urls/${ShortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let user = FindUserObject(req.cookies.user_id)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ,
                         username: user};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params)
  let id = req.params.shortURL
  delete urlDatabase[id]
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body['Key'];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let ur = urlDatabase[req.params.shortURL];
  res.redirect(ur);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

