const mongoose = require("mongoose");

// payment_type

const paymentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PaymentType = mongoose.model("PaymentType", paymentTypeSchema);
module.exports = PaymentType;
