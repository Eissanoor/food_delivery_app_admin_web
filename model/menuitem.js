const mongoose = require("mongoose");
const validator = require("validator");
const menuitemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);
const menuitem = new mongoose.model("menuitem", menuitemSchema);
module.exports = menuitem;
