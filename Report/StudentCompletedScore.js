const mongoose = require("mongoose");

const scoreReportCompletedSchema = new mongoose.Schema({
  // --- Student & Class Information ---
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
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

  // --- Detailed Score Breakdown ---
  attendance_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  class_practice: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  home_work: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  assignment_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 12,
  },
  presentation: {
    type: Number,
    default: 0,
    min: 0,
    max: 13,
  },
  work_book: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  revision_test: {
    type: Number,
    default: 0,
  },
  final_exam: {
    type: Number,
    default: 0,
    min: 0,
    max: 30,
  },

  // --- Calculated Total ---
  total_score: {
    type: Number,
    default: 0,
  },

  // --- Timestamp ---
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Compound Index ---
// This can help prevent duplicate score reports for the same student in the same class.
module.exports = mongoose.model(
  "ScoreReportCompleted",
  scoreReportCompletedSchema
);
