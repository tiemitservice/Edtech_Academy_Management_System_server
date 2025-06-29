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
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: false,
    },

    gender: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    province: {
      type: String,
      required: false,
    },
    district: {
      type: String,
      required: false,
    },
    commune: {
      type: String,
      required: false,
    },
    village: {
      type: String,
      required: false,
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
    document_type: {
      type: String,
      required: false,
    },
    document_number: {
      type: String,
      required: false,
    },
    document_image: {
      type: String,
      required: false,
    },

    address: {
      type: String,
      required: false,
    },

    st_birth_province: {
      type: String,
      required: false,
    },
    st_birth_district: {
      type: String,
      required: false,
    },
    st_birth_commune: {
      type: String,
      required: false,
    },
    st_birth_village: {
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
    father_phone: {
      type: String,
      required: false,
      unique: true,
    },
    mother_phone: {
      type: String,
      required: false,
      unique: true,
    },
    family_province: {
      type: String,
      required: false,
    },
    family_district: {
      type: String,
      required: false,
    },
    family_commune: {
      type: String,
      required: false,
    },
    family_village: {
      type: String,
      required: false,
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
