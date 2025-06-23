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
  start_date: [
    {
      type: String,
      required: true,
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});
const staffPermission = mongoose.model(
  "StaffPermission",
  staffPermissionSchema
);
module.exports = staffPermission;
