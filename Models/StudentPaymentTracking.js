// models/StudentInvoiceGenerate.js

const mongoose = require("mongoose");
// 1. Import the mongoose-sequence library

const studnetPaymentTrackingSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    first_payment_date: {
      type: String,
      required: false,
    },
    next_payment_date: {
      type: String,
      required: false,
    },
    payment_type: {
      type: String,
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentPaymentTracking",
  studnetPaymentTrackingSchema
);
