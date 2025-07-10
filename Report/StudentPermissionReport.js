// student permission report
const mongoose = require("mongoose");

const studentPermissionReportSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },

    permission_status: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    // teacher_id
    approve_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model(
  "StudentPermissionReport",
  studentPermissionReportSchema
);
