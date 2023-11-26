const { Schema, mongoose } = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "SignUp",
      require: true,
    },
    
    status: String,
    totalPrice: Number,
  },
  {
    timestamps: true,
  }
);

const order = new mongoose.model("order", orderSchema);
module.exports = order;
