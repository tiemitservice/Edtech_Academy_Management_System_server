const mongoose = require("mongoose");
const studentPermissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  sent_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  student_id: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  permissent_status: {
    type: String,
    default: "pending",
  },
});

const StudentPermission = mongoose.model(
  "StudentPermission",
  studentPermissionSchema
);
module.exports = StudentPermission;
