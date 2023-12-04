const { Schema, mongoose } = require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "SignUp",
      require: true,
    },
    foodId: { type: Schema.Types.ObjectId, ref: "menuitem", require: true },

   text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const review = new mongoose.model("review", reviewSchema);
module.exports = review;
