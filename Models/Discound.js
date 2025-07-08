// discount

const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Discount", discountSchema);
