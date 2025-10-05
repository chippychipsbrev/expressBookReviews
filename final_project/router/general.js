const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Promise function to get all books (Task 10)
const getBooks = () => {
    return new Promise((resolve, reject) => {
        if (books && Object.keys(books).length > 0) {
            resolve(books);
        } else {
            reject(new Error("No books available in the shop"));
        }
    });
};

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBooks()
    .then(booksData => {
        return res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch(error => {
        return res.status(404).json({ message: error.message });
    });
});

// Promise function to get book by ISBN (Task 11)
const getByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    });
};

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getByISBN(req.params.isbn)
    .then(result => {
        res.status(200).send(result);
    })
    .catch(error => {
        res.status(error.status).json({ message: error.message });
    });
});

// Promise function to get books by author (Task 12)
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        let filteredBooks = [];
        
        for (let key in books) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                filteredBooks.push(books[key]);
            }
        }

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject(new Error(`No books found by author: ${author}`));
        }
    });
};

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    
    getBooksByAuthor(author)
    .then(filteredBooks => {
        res.status(200).send(filteredBooks);
    })
    .catch(error => {
        res.status(404).json({ message: error.message });
    });
});

// Promise function to get books by title (Task 13)
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        let filteredBooks = [];
        
        for (let key in books) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                filteredBooks.push(books[key]);
            }
        }

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject(new Error(`No books found with title: ${title}`));
        }
    });
};

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    
    getBooksByTitle(title)
    .then(filteredBooks => {
        res.status(200).send(filteredBooks);
    })
    .catch(error => {
        res.status(404).json({ message: error.message });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    getByISBN(isbn)
    .then(book => {
        if (book.reviews && Object.keys(book.reviews).length > 0) {
            res.status(200).json(book.reviews);
        } else {
            res.status(404).json({ message: "No reviews found for this book" });
        }
    })
    .catch(error => {
        res.status(error.status).json({ message: error.message });
    });
});

module.exports.general = public_users;