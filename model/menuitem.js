const mongoose = require("mongoose");
const validator = require("validator");
const menuitemSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: String,
    categoryId: {
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
