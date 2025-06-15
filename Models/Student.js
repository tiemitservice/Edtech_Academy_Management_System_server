const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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
    midterm_score: {
      type: Number,
      required: false,
      default: 0,
    },
    final_score: {
      type: Number,
      required: false,
      default: 0,
    },
    quiz_score: {
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
    score_status: {
      type: String,
    },
    old_final_score: {
      type: Number,
      required: false,
      default: 0,
    },
    old_midterm_score: {
      type: Number,
      required: false,
      default: 0,
    },
    old_quiz_score: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);
// Apply the auto-increment plugin to student_id field
studentSchema.plugin(AutoIncrement, { inc_field: "student_id" });

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
