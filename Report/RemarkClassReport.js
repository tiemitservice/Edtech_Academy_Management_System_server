const mongoose = require("mongoose");
// mark class report

const RemarkClassReportSchema = new mongoose.Schema({
  student_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    {
      attendance_score: { type: Number, default: 0, min: 0, max: 100 },
      class_practice: { type: Number, default: 0, min: 0, max: 5 },
      home_work: { type: Number, default: 0, min: 0, max: 5 },
      assignment_score: { type: Number, default: 0, min: 0, max: 12 },
      presentation: { type: Number, default: 0, min: 0, max: 13 },
      revision_test: { type: Number, default: 0 },
      final_exam: { type: Number, default: 0, min: 0, max: 30 },
      total_score: { type: Number, default: 0 },
      work_book: { type: Number, default: 0, min: 0, max: 10 }, // { type: String, default: 0, min: 0, max: 10 },
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
