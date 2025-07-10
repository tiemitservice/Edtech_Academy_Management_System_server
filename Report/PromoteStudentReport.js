// this is promote student report

const mongoose = require("mongoose");

const promoteStudentReportSchema = new mongoose.Schema({
  students: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    },
  ],
  from_class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model(
  "PromoteStudentReport",
  promoteStudentReportSchema
);
