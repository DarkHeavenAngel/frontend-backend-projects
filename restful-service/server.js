const express = require('express');
const mongoose = require('mongoose');
const bookDao = require('./bookDao');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const dbUrl = 'mongodb://localhost:27017/bookstore';
mongoose.connect(dbUrl) 
.then(() => {
    app.listen(8000, function() {
        console.log('Server is running on port 8000');
    });
})
.catch(err => console.log(err));
    
app.post('/api/books', async function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log('Sent a request for adding a book');

    try {
        const newBook = await bookDao.create(req.body);
        res.send(newBook);
    } catch (err) {
        console.log(err);
        res.send("Adding book failed");
    }
});

app.get('/api/books', async function (req, res) {
    console.log('Sent a request for all books');

    try {
        const books = await bookDao.getAll();
        res.send(books);
    } catch (err) {
        console.log(err);
        res.send('Getting books failed');
    }
});

app.get('/api/books/:id', async function (req, res) {
    const id = req.params.id;
    console.log('Sent a request for a specific book' + id);

    try {
        const book = await bookDao.getById(id);
        res.send(book);
    } catch (err) {
        console.log(err);
        res.send('Getting the book failed');
    }
});

app.put('/api/books/:id', async function (req, res) {
    if(!req.body) return res.sendStatus(400);
    console.log('Sent a request for updating a book');

    const id = req.params.id;
    try {
        const updatedBook = await bookDao.update(id, req.body);
        res.send(updatedBook);
    } catch (err) {
        console.log(err);
        res.send('Updating book failed');
    }
});

app.delete('/api/books/:id', async function (req, res) {
    const id = req.params.id;
    console.log('Sent a request for deleting a book');

    try {
        const deletedBook = await bookDao.delete(id);
        res.send(deletedBook);
    } catch (err) {
        console.log(err);
        res.send('Deleting book failed');
    }
});

app.get('/api/books/authorStats/:authorName', async function (req, res) {
    const authorName = req.params.authorName;
    console.log('Sent a request for author stats' + authorName);
    try {
        const authorStats = await bookDao.getAuthorStats(authorName);
        res.send(authorStats);
    } catch (err) {
        console.log(err);
        res.send('Getting author stats failed');
    }
});

