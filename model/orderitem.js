const { Schema, mongoose } = require("mongoose");
const orderitemSchema = new mongoose.Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "order",
      require: true,
    },
    foodId: { type: Schema.Types.ObjectId, ref: "menuitem", require: true },

    quantity: Number,
    status:String,
  },
  {
    timestamps: true,
  }
);

const orderitem = new mongoose.model("orderitem", orderitemSchema);
module.exports = orderitem;
