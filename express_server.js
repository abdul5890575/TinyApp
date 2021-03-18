const express = require("express");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

var FindUserByEmail = require('./helpers');

const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['asdf'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "Asm5xK": { longURL: "https://www.google.ca", userID: "aJ48lW" },
  "X3YwTT": { longURL: "https://www.facebook.com", userID: "Lh3H2a" },
  "L3S33T": { longURL: "https://www.instagram.com", userID: "Lh3H2a" }
};

let users = {  "aJ48lW": {
                                id: "aJ48lW", 
                                email: "abdul@gmail.com", 
                                password: "$2b$10$LURWZTi2gVPOpQcXaTDHS.rRbRBrE3Y/Pmb6INc4Bh2cEbRoO5yD2" //aaaaa
                                },
                "Lh3H2a": {
                                  id: "Lh3H2a", 
                                  email: "verma@gmail.com", 
                                  password: "$2b$10$MwAOTkfw5eobQiNscBZgJeronij/pXmEMvSKjjGneTe1wOwleeOFe" //bbbbb
                                  },
                                               
                              };



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
      return userSignedInObject;
    }
  }
  return;
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
app.get("/login", (req, res) => {
  let user = FindUserObject(req.session.user_id)
  const templateVars = { urls: urlDatabase,
                          username: user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let user = FindUserByEmail(req.body.email,users)
  const templateVars = { username: user }
  let hashedPassword = user['password'];
  console.log(hashedPassword)
  if (user === false) {
    res.status(403).send('Error: 404 Email does not exist')
  } else if (bcrypt.compareSync(req.body.password, hashedPassword)){
    req.session.user_id = user['id'];
    res.redirect('/urls');
  } else {
    res.status(403).send('Error: 404 Password does not match'); 
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let user = FindUserObject(req.session.user_id)
  const templateVars = { urls: urlDatabase,
                         username: user }
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  let idstring = generateRandomString();
  const password = req.body.password; 
  const hashedPassword = bcrypt.hashSync(password, 10);
  let innerObject = { id : idstring, email : req.body.email, password : hashedPassword}
  if (req.body.email === '' || req.body.password === '' ) {
    res.status(404).send('Error: 404 Email or Password empty')
  } else if(CheckDatabaseForEmails(req.body.email)) {
    res.status(400).send('Error: 400 Email already exists')
  }else {
    
    users[idstring] = innerObject;
    console.log(users)
    res.cookie('user_id', idstring)
    res.redirect('/urls')
  }
});

//--------------------------------------------------------------//
app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  let user = FindUserObject(req.session.user_id)
  const templateVars = { urls: urlDatabase,
                         username: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else{
    let user = FindUserObject(req.session.user_id)
    const templateVars = { username: user };
    res.render("urls_new",templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let ShortURL = generateRandomString();
    urlDatabase[ShortURL] = { longURL:'http://'+req.body.longURL, userID:req.session.user_id};
    res.redirect(`/urls/${ShortURL}`);
  } else {
    res.redirect('/login')
  }

});

app.get("/urls/:shortURL", (req, res) => {
  let user = FindUserObject(req.session.user_id)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] ,
                         username: user, reqID :req.session.user_id};
    if (!user){
      res.status(400).send('Error: Sorry this is not your link')
    } else if (user['id'] === req.session.user_id) {
      res.render("urls_show", templateVars);
    }       
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.params.shortURL
  if (req.session.user_id === urlDatabase[id]['userID']) {
    delete urlDatabase[id]
    res.redirect('/urls');
  } else {
    return 'Sorry you are not authorized to delete this item'
  }
});


app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  if (req.session.user_id === urlDatabase[id]['userID']) {
  urlDatabase[req.params.id]['longURL'] = req.body['Key'];
  res.redirect('/urls');
  } else {
    return 'Sorry you are not authorized to edit this item'
  }
});

app.get("/u/:shortURL", (req, res) => {
  let ur = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(ur);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

