const mongoose = require("mongoose");
const validator = require("validator");
const catagresSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const catagres = new mongoose.model("catagres", catagresSchema);
module.exports = catagres;
