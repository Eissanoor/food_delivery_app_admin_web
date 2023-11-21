const { Schema, mongoose } = require("mongoose");
const wishSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "SignUp",
      require: true,
    },
    foodId: { type: Schema.Types.ObjectId, ref: "menuitem", require: true },
  },
  {
    timestamps: true,
  }
);

const wishList = new mongoose.model("wishlist", wishSchema);
module.exports = wishList;
