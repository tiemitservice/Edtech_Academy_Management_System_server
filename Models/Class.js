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
        attendance_score: { type: Number, default: 0 },
        class_practice: { type: Number, default: 0 },
        home_work: { type: Number, default: 0 },
        assignment_score: { type: Number, default: 0 },
        presentation: { type: Number, default: 0 },
        revision_test: { type: Number, default: 0 },
        final_exam: { type: Number, default: 0 },
        total_score: { type: Number, default: 0 },
        note: { type: String, default: "" },
        exit_time: { type: String, default: "" },
        entry_time: { type: String, default: "" },
        checking_at: { type: String },
        attendance: {
          type: String,
          enum: ["present", "absent", "late", "permission"],
        },
      },
    ],

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    status: {
      type: Boolean,
      default: true,
    },
    day_class: {
      type: Array,
    },
    duration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    mark_as_completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
