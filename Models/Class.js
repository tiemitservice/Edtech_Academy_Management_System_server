const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    status: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;