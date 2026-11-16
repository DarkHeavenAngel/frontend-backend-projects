const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    author: String,
    title: String,
    genre: String,
    year: Number
}, { versionKey: false });

module.exports = mongoose.model('Book', bookSchema);
