const jwt = require("jsonwebtoken");
const Register = require("../model/providerregister");
var dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const SECRET = process.env.SECRET;

var auth = async (req, res, next) => {
  try {
    var token = req.headers.authorization;
    
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token not provided" });
    }

    token = token.split(" ")[1];
    
    const verifiedUser = jwt.verify(token, SECRET);
    
    const user = await Register.findOne({ _id: verifiedUser._id });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
module.exports = auth;
