// this is student complete payment report

const mongoose = require("mongoose");

const studentCompletePaymentReportSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  payment_date: {
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
  mark_status: {
    type: String,
    default: "done",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudentCompletePaymentReport = mongoose.model(
  "StudentCompletePaymentReport",
  studentCompletePaymentReportSchema
);
module.exports = StudentCompletePaymentReport;
