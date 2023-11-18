const mongoose = require("mongoose");
const validator = require("validator");
// const autoIncrement = require("mongoose-auto-increment");
const catagresSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    categoryId: Number,
  },
  {
    timestamps: true,
  }
);

// catagresSchema.plugin(autoIncrement.plugin, {
//   model: "catagres",
//   field: "categoryId",
//   startAt: 1,
// });
const catagres = new mongoose.model("catagres", catagresSchema);
module.exports = catagres;
