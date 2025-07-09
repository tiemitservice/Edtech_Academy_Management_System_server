// book stock history report
const mongoose = require("mongoose");

const stockHistoryReportSchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  //   when sell book
  stock_out: {
    type: Number,
    required: false,
  },
  //   when update stock
  stock_in: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("StockHistoryReport", stockHistoryReportSchema);
