const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    start_time: {
        type: String,
        required: true,
    },
    end_time: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;