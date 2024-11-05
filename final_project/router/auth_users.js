const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
      if (!isValid(username)) {
        users.push({
          username: username,
          password: password
        });
        return res.status(200).json({ message: `Customer successfully registered. Now you can login.` });
      } else {
        return res.status(409).json({ message: "Username already exists. Choose a different username." });
      }
    } else {
      return res.status(400).json({ message: "Invalid request. Provide both username and password." });
    }
  });
  
//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    
    if (authenticatedUser(username, password)) {
        
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const isbn = req.params.isbn;
    let bookreview = books[isbn];
    if (bookreview)
    {
    let review = req.query.review;
    let username = req.session.authorization.username;
    if (review){
        bookreview.reviews[username]=review;
    }
    books[isbn]=bookreview;
    res.status(200).json({message:"Book review added/updated"});
    }
    else {
        res.send("Error");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let bookreviewdel = books[isbn];
    let username=req.session.authorization.username;
    if (bookreviewdel)
    {
        delete bookreviewdel.reviews[username];
        res.send("Book Review Deleted");
    }
    else 
    {
        res.send("Error");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
