const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
    },
    is_reminder: {
      type: Boolean,
      required: false,
      default: true,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    image: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: false,
      // default: null,
      unique: true,
    },
    resetToken: {
      type: String,
      default: null,
    },

    resetedAt: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      required: false,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    // ascess side bar in dashboard system
    permissions: {
      type: [String], // more specific
      default: [], // good to default to empty
    },
  },
  { timestamps: true }
);

userSchema.add({
  fullName: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
