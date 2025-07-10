const mongoose = require("mongoose");
const staffPermissionSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  // array
  hold_date: {
    type: Array,
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
  // true = accepted, false = rejected
  status: {
    type: String,
    enum: ["accepted", "rejected", "pending"],
    default: "pending",
  },
  note: {
    type: String,
    required: false,
  },
});
const staffPermission = mongoose.model(
  "StaffPermission",
  staffPermissionSchema
);
module.exports = staffPermission;
