const mongoose = require('../../database');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    image: {
        type: String,
    },
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;