const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    is_active: {
        type: Boolean,
        // if a false booked if true free
        default: true
    },
    booked_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    booking_date: {
        type: Date,
        default: Date.now,
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    // start_time: {
    //     type: String,
    //     required: false,
    // },
    // end_time: {
    //     type: String,
    //     required: false,
    // },
    booking_peding: {
        type: Boolean,
        // approve booking 
        default: false
    },
    duration: {
        type: String,
        required: false,
    },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;