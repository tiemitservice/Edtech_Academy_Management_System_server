const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    kh_name: { type: String, required: true },
    en_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    workday: { type: Array, required: false },
    gender: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    date_intered: { type: Date, default: Date.now },
    status: { type: Boolean, required: true, default: true },
    image: { type: String },
    position: { // Fixed typo from 'posistion' to 'position'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position',
    },
    department: { // Singular, as in your schema
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    address: { type: String, required: false },
    date_of_birth: { type: Date, required: true },
    salary: { type: Number, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    district: { type: String, required: false },
    village: { type: String, required: false },
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;