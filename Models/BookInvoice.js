const mongoose = require("mongoose");

// --- Counter Schema and Model ---
// This model will store the current sequence number for our invoices.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 }, // Start counting from 1000
});
const Counter = mongoose.model("Counter", counterSchema);

// --- Book Invoice Schema ---
const bookInvoiceSchema = new mongoose.Schema(
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
// This function runs before any 'BookInvoice' document is saved.
bookInvoiceSchema.pre("save", async function (next) {
  // 'this' refers to the document being saved.
  const doc = this;

  // Only generate an invoice_id if it's a new document.
  if (doc.isNew) {
    try {
      // Find the counter document for invoices and increment its sequence number.
      // The { new: true } option ensures we get the updated document back.
      const counter = await Counter.findByIdAndUpdate(
        { _id: "invoiceId" }, // The ID of our counter
        { $inc: { seq: 1 } }, // Increment the 'seq' field by 1
        { new: true, upsert: true } // Create it if it doesn't exist
      );

      // Assign the new sequence number to the document's invoice_id.
      doc.invoice_id = counter.seq;
      next(); // Proceed with the save operation.
    } catch (error) {
      // If there's an error, pass it to the next middleware.
      return next(error);
    }
  } else {
    // If the document is not new, just proceed without changes.
    next();
  }
});

module.exports = mongoose.model("BookInvoice", bookInvoiceSchema);
