const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
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

// Apply the auto-increment plugin to section_id field
sectionSchema.plugin(AutoIncrement, { inc_field: "id" });

const Section = mongoose.model("Subject", sectionSchema);

module.exports = Section;
