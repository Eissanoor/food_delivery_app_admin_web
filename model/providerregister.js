const mongoose = require("mongoose");
// const autoIncrement = require("mongoose-auto-increment");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const SECRET = process.env.SECRET;

const empoleeSchema = new mongoose.Schema(
  {
    
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    isVarified: String,
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    password: String,
    Phone: Number,
    address: String,
    ProfileImage: String,
    date: String,
    fullname: String,
  },
  {
    timestamps: true,
  }
);

// Apply the auto-increment plugin to the schema
// empoleeSchema.plugin(autoIncrement.plugin, {
//   model: "SignUp",
//   field: "Id",
//   startAt: 1,
// });

empoleeSchema.methods.generateAuthToken = async function () {
  try {
    const token = await jwt.sign({ _id: this._id.toString() }, SECRET, {
      expiresIn: "5m",
    });
    this.tokens = this.tokens.concat({ token: token });
    await this.save();

    return token;
  } catch (error) {
    console.log(error);
    console.log("the error part");
  }
};

empoleeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const providerRegister = new mongoose.model("SignUp", empoleeSchema);

module.exports = providerRegister;
