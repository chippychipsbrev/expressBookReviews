const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    })

    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
	let validusers = users.filter((user) => {
		return (user.username === username && user.password === password);
	});

	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
	 // validate input
	 if (!username || !password) {
		return res.status(400).json({ message: "Username and password are required" });
	 }

	 // check authentication
	 if (authenticatedUser(username,password)) {
		// generate jwt token
		let accessToken = jwt.sign({
			data: password,
		}, 'access', { expiresIn: 60 * 60 });

		// store the access token and username in session
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
  let book = books[isbn];

  if (book) {
    let author = req.body.author;
    let title = req.body.title;
    let review = req.body.review;
    let username = req.session.authorization?.username;

    // update author if provided
    if (author) {
      book["author"] = author;
    }

    // update title if provided
    if (title) {
      book["title"] = title;
    }

    // add or update review if provided and user logged in
    if (review && username) {
      book["reviews"][username] = review;
    }

    // update the book record
    books[isbn] = book;
    res.status(200).send(`Book with the ISBN ${isbn} updated successfully.`);
  } else {
    res.status(404).send("Unable to find book!");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
