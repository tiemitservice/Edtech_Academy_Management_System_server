const { min } = require("moment");
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        attendance_score: { type: Number, default: 0, min: 0, max: 100 },
        class_practice: { type: Number, default: 0, min: 0, max: 5 },
        home_work: { type: Number, default: 0, min: 0, max: 5 },
        assignment_score: { type: Number, default: 0, min: 0, max: 12 },
        presentation: { type: Number, default: 0, min: 0, max: 13 },
        revision_test: { type: Number, default: 0 },
        final_exam: { type: Number, default: 0, min: 0, max: 30 },
        total_score: { type: Number, default: 0 },
        work_book: { type: Number, default: 0, min: 0, max: 10 }, // { type: String, default: 0, min: 0, max: 10 },
        note: { type: String, default: "" },
        exit_time: { type: String, default: "" },
        entry_time: { type: String, default: "" },
        comments: { type: String, enum: ["passed", "failed"] },
        checking_at: { type: String },
        attendance: {
          type: String,
          enum: ["present", "absent", "late", "permission"],
        },
      },
    ],

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    // subject
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    day_class: {
      type: Array,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    duration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    status: {
      type: Boolean,
      default: true,
    },
    mark_as_completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
