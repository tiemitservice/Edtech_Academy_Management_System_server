const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    kh_name: {
      type: String,
      required: true,
    },
    eng_name: {
      type: String,
      required: true,
    },
    student_type: {
      type: String,
      required: true,
    },
    teacher: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: false,
      },
    ],
    gender: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    date_intered: {
      type: Date,
      default: Date.now,
    },

    image: {
      type: String,
    },
    address: {
      type: String,
      required: false,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    father_name: {
      type: String,
      required: false,
    },
    mother_name: {
      type: String,
      required: false,
    },
    score: {
      type: Number,
      required: false,
      default: 0,
    },
    attendence: {
      type: Number,
      required: false,
      default: 0,
    },
    attendence_date: {
      type: Date,
      required: false,
    },
    total_attendance_score: {
      type: Number,
      required: false,
      default: 0,
    },
    attendence_enum: {
      type: String, // present, absent, late
      required: false,
    },
    rental_book: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: false,
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
