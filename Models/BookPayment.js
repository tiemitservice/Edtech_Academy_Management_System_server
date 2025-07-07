// book with student
const mongoose = require("mongoose");

const bookPaymentSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BookPayment", bookPaymentSchema);
