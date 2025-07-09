// attendace report

const mongoose = require("mongoose");
const AttendanceReportSchema = new mongoose.Schema({
  students: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      checking_at: { type: String },
      attendance: {
        type: String,
        enum: ["present", "absent", "late", "permission"],
      },
    },
  ],
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  duration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  transaction_type: {
    type: String,
    required: true,
    default: "Attendance",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
module.exports =
  mongoose.models.AttendanceReport ||
  mongoose.model("AttendanceReport", AttendanceReportSchema);
