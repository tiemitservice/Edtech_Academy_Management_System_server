const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    set_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entry_time: {
      type: String,
      required: false,
    },
    exit_time: {
      type: String,
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
const StaffAttendance = mongoose.model("StaffAttendance", attendanceSchema);

module.exports = StaffAttendance;
