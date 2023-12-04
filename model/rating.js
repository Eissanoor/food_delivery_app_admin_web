const { Schema, mongoose } = require("mongoose");
const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "SignUp",
      require: true,
    },
    foodId: { type: Schema.Types.ObjectId, ref: "menuitem", require: true },

   rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const rating = new mongoose.model("rating", ratingSchema);
module.exports = rating;
