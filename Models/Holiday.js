const mongoose = require("mongoose");
const holidaySchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
      unique: true,
    },
    holidays: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);
const Holiday = mongoose.model("Holiday", holidaySchema);
module.exports = Holiday;
