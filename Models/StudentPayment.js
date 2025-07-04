const mongoose = require("mongoose");
const moment = require("moment");

const studentPaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    payment_type: {
      type: String,
      enum: ["tuition", "registration", "uniform", "other"],
      required: true,
    },
    amount: Number,
    paid_date: {
      type: String,
      required: true,
    },
    next_due_date: {
      type: String,
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "paid",
    },
    description: String,
    late_days: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ Pre-save middleware to calculate late_days
studentPaymentSchema.pre("save", function (next) {
  if (this.next_due_date) {
    const today = moment().startOf("day");
    const dueDate = moment(this.next_due_date, "YYYY-MM-DD").startOf("day");
    const lateDays = today.diff(dueDate, "days");
    this.late_days = lateDays > 0 ? lateDays : 0;
  } else {
    this.late_days = 0;
  }
  next();
});

// ✅ Pre-update middleware to calculate late_days on updates
studentPaymentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.next_due_date) {
    const today = moment().startOf("day");
    const dueDate = moment(update.next_due_date, "YYYY-MM-DD").startOf("day");
    const lateDays = today.diff(dueDate, "days");
    update.late_days = lateDays > 0 ? lateDays : 0;
  }
  next();
});

module.exports = mongoose.model("StudentPayment", studentPaymentSchema);
