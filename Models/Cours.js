const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: false,
    },
    discount: {
        type: Number,
        required: false,
        default: 0
    },
    status: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const Cours = mongoose.model('Cours', coursSchema);

module.exports = Cours;