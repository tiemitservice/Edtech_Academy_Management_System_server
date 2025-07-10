// teacher attendance report

const mongoose = require("mongoose");

const teacherAttendanceReportSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    entry_time: {
      type: String,
      required: false,
    },
    exit_time: {
      type: String,
      required: false,
    },
    checking_at: {
      type: Date,
      default: Date.now,
    },
    attendance_status: {
      type: String,
      required: false,
      enum: ["present", "absent", "late", "permission"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model(
  "TeacherAttendanceReport",
  teacherAttendanceReportSchema
);
