const mongoose = require("mongoose");

// --- Counter Schema and Model ---
// This model will store the current sequence number for our invoices.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }, // Start counting from 1000
});
const Counter = mongoose.model("Counter", counterSchema);

// --- Book Payment Schema ---
const bookPaymentSchema = new mongoose.Schema(
  {
    // This field will be populated by the pre-save hook.
    invoice_id: {
      type: Number,
      unique: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    book_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    ],
    book_amount: {
      type: Number,
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
    mark_as_completed: {
      type: Boolean,
      default: false,
    },
    transaction: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// --- Mongoose Pre-Save Hook ---
// This function runs before any 'BookPayment' document is saved.
bookPaymentSchema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "bookPaymentInvoiceId" }, // Use a unique ID for this counter
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.invoice_id = counter.seq;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("BookPayment", bookPaymentSchema);
