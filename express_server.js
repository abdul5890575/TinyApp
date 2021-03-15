const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomarray = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  let result = ''
  for (let i = 0; i < 6; i++) {
    let indNum = Math.floor(Math.random() * (26 - 0) + 0);
    result += randomarray[indNum]
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    console.log(req.params.shortURL)
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});  

// app.get("/hello", (req, res) => {
//     const templateVars = { greeting: 'Hello World!' };
//     res.render("hello_world", templateVars);
//   });

// app.get("/set", (req, res) => {
//  const a = 1;
//  res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//  res.send(`a = ${a}`);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

