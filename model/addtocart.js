const { Schema, mongoose } = require("mongoose");
const addtocartSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "SignUp",
      require: true,
    },
    foodId: { type: Schema.Types.ObjectId, ref: "menuitem", require: true },
    status: String,
    quantity:Number
  },
  {
    timestamps: true,
  }
);

const addtocart = new mongoose.model("addtocart", addtocartSchema);
module.exports = addtocart;
