// models/StudentInvoiceGenerate.js

const mongoose = require("mongoose");
// 1. Import the mongoose-sequence library
const AutoIncrement = require("mongoose-sequence")(mongoose);

const studentInvoiceGenerateSchema = new mongoose.Schema(
  {
    // You don't need to define invoice_id here, the plugin will add it.
    // However, defining it can be useful for clarity.
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

// 2. Apply the auto-increment plugin to the schema
studentInvoiceGenerateSchema.plugin(AutoIncrement, {
  id: "invoice_counter", // A unique identifier for this sequence
  inc_field: "invoice_id", // The field to increment

  // 3. Add the custom formatting
  // The 'format' function takes the counter value and returns the formatted string
  // 'padStart(4, '0')' ensures the string is at least 4 characters long,
  // padding with '0' on the left if it's shorter.
  // e.g., 1 -> "0001", 10 -> "0010", 123 -> "0123"
  format: (value) => `${value.toString().padStart(4, "0")}`,

  // You can also specify where the sequence should start
  start_seq: 1,
});

module.exports = mongoose.model(
  "StudentInvoiceGenerate",
  studentInvoiceGenerateSchema
);
