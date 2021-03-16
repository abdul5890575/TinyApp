const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Asm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomarray = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  let result = '';
  for (let i = 0; i < 6; i++) {
    let indNum = Math.floor(Math.random() * (26 - 0) + 0);
    result += randomarray[indNum];
  }
  return result;
}

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let ShortURL = generateRandomString();
  urlDatabase[ShortURL] = 'http://'+req.body.longURL;
  res.redirect(`/urls/${ShortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params)
  let urr = req.params.shortURL
  delete urlDatabase[urr]
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let ur = urlDatabase[req.params.shortURL];
  res.redirect(ur);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

