const mongoose = require("mongoose");
const catagresSchema = new mongoose.Schema(
  {
    categoryId:Number,
  },
  {
    timestamps: true,
  }
);

const catagres = new mongoose.model("counting", catagresSchema);
module.exports = catagres;
