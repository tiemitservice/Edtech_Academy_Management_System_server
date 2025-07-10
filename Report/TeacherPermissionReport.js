// teacher permission report

const mongoose = require("mongoose");

const teacherPermissionReportSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    checking_at: {
      type: Date,
      default: Date.now,
    },
    permission_status: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    aprove_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
    hold_date: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);
const teacherPermissionReport = mongoose.model(
  "TeacherPermissionReport",
  teacherPermissionReportSchema
);
module.exports = teacherPermissionReport;
