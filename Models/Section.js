const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const sectionSchema = new mongoose.Schema(
  {
    section_id: {
      type: Number,
      unique: true,
    },
    // start_time: {
    //   type: String,
    //   required: true,
    // },
    // end_time: {
    //   type: String,
    //   required: true,
    // },
    duration: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Apply the auto-increment plugin to section_id field
sectionSchema.plugin(AutoIncrement, { inc_field: "section_id" });

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
