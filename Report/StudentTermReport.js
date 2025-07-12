const mongoose = require("mongoose");

const studentTermReportSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    // To identify the term, e.g., "Term 1: Jan-Mar 2025"
    term_name: {
      type: String,
      required: true,
    },
    // The start and end dates of the term this report covers
    term_start_date: {
      type: Date,
      required: true,
    },
    term_end_date: {
      type: Date,
      required: true,
    },
    // An array of the classes the student completed during this term
    classes: [
      {
        class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
        subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        final_score_for_class: { type: Number },
      },
    ],
    // The overall average score for the term
    term_average_score: {
      type: Number,
      default: 0,
    },
    // The final result for the term
    term_result: {
      type: String,
      enum: ["passed", "failed", "incomplete"],
      default: "incomplete",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentTermReport", studentTermReportSchema);
