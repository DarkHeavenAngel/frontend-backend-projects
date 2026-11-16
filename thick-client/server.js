const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bookDao = require('./bookDao');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('ui'));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

const dbUrl = 'mongodb://localhost:27017/bookstore';
mongoose.connect(dbUrl) 
.then(() => {
    app.listen(8000, function() {
        console.log('Server is running on port 8000');
    });
})
.catch(err => console.log(err));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Wrong username or password' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/auth/status', (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
});

function requireAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}

app.post('/api/books', requireAdmin, async function (req, res) {
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

app.put('/api/books/:id', requireAdmin, async function (req, res) {
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

app.delete('/api/books/:id', requireAdmin, async function (req, res) {
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

