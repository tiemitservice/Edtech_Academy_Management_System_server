// book payment report
const mongoose = require("mongoose");

const bookPaymentReportSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("BookPaymentReport", bookPaymentReportSchema);
