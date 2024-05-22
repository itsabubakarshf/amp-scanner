const jwt = require("jsonwebtoken");
const User = require("../models/user/user");
require('dotenv').config();
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new Error("Authorization token not provided");
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      var decoded = jwt.verify(token, process.env.token_key);

    } catch (e) {
      throw new Error("Token is not Valid")
    }
    const user = await User.findOne({
      _id: decoded?._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("Faild to authenticate");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ message: "Faild to authenticate", errMessage: e.message });
  }
};

module.exports = auth;