const mongoose = require('mongoose');

const bookCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    sort_name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const BookCategory = mongoose.model('BookCategory', bookCategorySchema);

module.exports = BookCategory;