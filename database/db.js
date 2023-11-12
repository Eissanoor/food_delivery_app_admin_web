const mongoose = require("mongoose");
// const autoIncrement = require("mongoose-auto-increment");
mongoose.Promise = global.Promise;
var dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
var DATABASE = process.env.DATABASE;

const MONGODB_URL = DATABASE;
// autoIncrement.initialize(mongoose.connection);
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: "true",
    useUnifiedTopology: "true",
  })
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((e) => console.log(e));
