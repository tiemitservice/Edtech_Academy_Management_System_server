const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // logo
    image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
