const mongoose = require("mongoose");
// mark class report

const RemarkClassReportSchema = new mongoose.Schema({
  student_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
  transaction_type: {
    type: String,
    required: true,
    default: "Remark  Class",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("RemarkClassReport", RemarkClassReportSchema);
