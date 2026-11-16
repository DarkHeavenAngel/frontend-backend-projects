const Book = require('./bookModel');

class BookDao {
    async getAll() { return await Book.find({}); }
    async getById(id) { return await Book.findOne({ _id: id }); }
    async create(bookData) { return await new Book(bookData).save(); }
    async update(id, bookData) { return await Book.findOneAndUpdate({ _id: id }, bookData, { new: true }); }
    async delete(id) { return await Book.findOneAndDelete({ _id: id }); }

    async getAuthorStats(authorName) {
        const books = await Book.find({ author: authorName });
        return {
            author: authorName,
            totalBooks: books.length,
            books: books
        };
    }
}

module.exports = new BookDao();
