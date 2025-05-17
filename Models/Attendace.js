const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    set_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        required: false,
    },
}, { timestamps: true });
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;