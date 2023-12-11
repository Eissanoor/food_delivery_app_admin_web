const { Schema, mongoose } = require("mongoose");
const StoresSchema = new mongoose.Schema(
  {
    
    foodId: { type: Schema.Types.ObjectId, ref: "menuitem", require: true },

        caption: { type: String, required: true },
        status: Number,
   expireIn:Number
  },
  {
    timestamps: true,
  }
);

const Stores = new mongoose.model("store", StoresSchema);
module.exports = Stores;
