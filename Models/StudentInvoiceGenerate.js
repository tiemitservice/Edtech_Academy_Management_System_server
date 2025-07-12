// this is student invoice generate
const mongoose = require("mongoose");

const studentInvoiceGenerateSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    final_price: {
      type: Number,
      required: false,
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
    transaction: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model(
  "StudentInvoiceGenerate",
  studentInvoiceGenerateSchema
);
