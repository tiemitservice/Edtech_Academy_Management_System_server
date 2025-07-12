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

  reason: {
    type: String,
    required: true,
  },
  hold_date: {
    type: Array,
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
  created_by: {
    type: String,
  },
});

const StudentPermission = mongoose.model(
  "StudentPermission",
  studentPermissionSchema
);
module.exports = StudentPermission;
