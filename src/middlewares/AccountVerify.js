const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const isVerified = req.user.isVerified;
    
    if(!isVerified){
       req.flash("verifyMessage","You need to verify your account")
       return res.render('post/upload')
    }

    next();
  } catch (err) {
    next(err);
  }
};
