const mongoose = require("mongoose");
// course invoice

const courseInvoiceSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  mark_as_completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("CourseInvoice", courseInvoiceSchema);
