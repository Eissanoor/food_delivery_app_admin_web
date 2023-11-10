const jwt = require("jsonwebtoken");
const Register = require("../model/providerregister");
const SECRET = "secret";
var auth = async (req, res, next) => {
  try {
    var token = req.headers.autherization;

    token = token.split(" ")[1];
    const varifyuser = jwt.verify(
      token,
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );

    const user = await Register.findOne({ _id: varifyuser._id });

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "UnAuthorized Person" });
  }
};
module.exports = auth;
