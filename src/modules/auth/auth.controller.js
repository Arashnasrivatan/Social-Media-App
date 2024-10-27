const { errorRespone, successResponse } = require("../../utils/responses");
const userModel = require("../../models/user");
const refreshTokenModel = require("../../models/refreshToken");
const resetPasswordModel = require("../../models/ResetPassword");
const crypto = require("crypto");
const nodeMailer = require("nodemailer");
const {
  registerValidationSchema,
  loginValidationSchema,
  forgotPasswordValidationSchema,
  ResetPasswordValidationSchema
} = require("./auth.validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { reset } = require("nodemon");

exports.register = async (req, res, next) => {
  try {
    const { email, username, name, password } = req.body;

    await registerValidationSchema.validate(
      {
        email,
        username,
        name,
        password
      },
      {
        abortEarly: false
      }
    );

    const isUserExist = await userModel.findOne({
      $or: [{ email }, { username }]
    });

    if (isUserExist) {
      // return errorRespone(res, 400, "Email or Username already Exists");
      req.flash("error", "Email or Username already Exists");

      return res.redirect("/auth/register");
    }
    const isFirstUser = (await userModel.countDocuments()) == 0;

    let role = "USER";

    if (isFirstUser) {
      role = "ADMIN";
    }

    let user = new userModel({ email, username, password, role, name });
    user = await user.save();

    // const accessToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "30day"
    // });

    // const refreshToken = await refreshTokenModel.createToken(user);

    // res.cookie("access-token", accessToken, {
    //   maxAge: 900_000,
    //   httpOnly: true
    // });
    // res.cookie("refresh-token", refreshToken, {
    //   maxAge: 900_000,
    //   httpOnly: true
    // });

    req.flash("success", "You Signed Successfully✌️");

    return res.redirect("/auth/login");

    // return successResponse(res, 201, {
    //   message: "User created successfully",
    //   ...user.toObject(),
    //   password: undefined
    // });
  } catch (err) {
    next(err);
  }
};

exports.showRegisterView = async (req, res) => {
  return res.render("auth/register");
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await loginValidationSchema.validate(
      {
        email,
        password
      },
      {
        abortEarly: false
      }
    );

    const user = await userModel.findOne({ email }).lean();

    if (!user) {
      req.flash("error", "user not found with this info");
      return res.redirect("/auth/login");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      req.flash("error", "Email or password is not correct");
      return res.redirect("/auth/login");
    }

    const accessToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day"
    });

    const refreshToken = await refreshTokenModel.createToken(user);

    res.cookie("access-token", accessToken, {
      maxAge: 999_000_000,
      httpOnly: true
    });
    res.cookie("refresh-token", refreshToken, {
      maxAge: 999_000_000,
      httpOnly: true
    });

    req.flash("success", "sign in Successfully✌️");

    return res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.showLoginView = async (req, res) => {
  return res.render("auth/login");
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userID = await refreshTokenModel.verifyToken(refreshToken);

    if (!userID) {
      return errorRespone(res, 401, "Invalid Refresh Token");
    }

    await refreshTokenModel.findOneAndDelete({ token: refreshToken });

    const user = await userModel.findById(userID);
    if (!user) {
      return errorRespone(res, 401, "User not found");
    }

    const accessToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day"
    });

    const newRefreshToken = await refreshTokenModel.createToken(user);

    // res.cookie("access-token", accessToken, {
    //   maxAge: 100_000,
    //   httpOnly: true
    // });

    // res.cookie("refresh-token", newRefreshToken, {
    //   maxAge: 999_000_000,
    //   httpOnly: true
    // });

    return successResponse(res, 200, {
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
};

exports.showForgotPasswordView = async (req, res, next) => {
  try {
    return res.render("auth/forgot-password");
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPasswordValidationSchema.validate(
      { email },
      { abortEarly: true }
    );

    const user = await userModel.findOne({ email });

    if (!user) {
      req.flash("error", "User not found with this email");
      return res.redirect("/auth/forgot-password");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenExpiresTime = Date.now() + 3600000; // 1 hour

    const resetPassword = new resetPasswordModel({
      user: user._id,
      token: resetToken,
      tokenExpireTime: resetTokenExpiresTime
    });

    await resetPassword.save();

    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "arashnasrivatan@gmail.com",
        pass: process.env.PASSWORD
      }
    });

    mailOptions = {
      from: "Arash Social",
      to: email,
      subject: "Reset Password",
      html: `
      <h1>Reset Password</h1>
      <p>Click on the link below to reset your password</p>
      <a href="http://localhost:4002/auth/reset-password/${resetToken}">Reset Password</a>
      `
    };

    transporter.sendMail(mailOptions);

    req.flash("success", "Check your email to reset password");
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};

exports.showResetPasswordView = async (req, res, next) => {
  try {

    const token = req.params.token;
    const validatetoken = await resetPasswordModel.findOne({ token, tokenExpireTime: {$gt: Date.now() }  });

    if (!validatetoken) {
      req.flash("error", "Invalid or Expired Token");
      return res.redirect("/auth/forgot-password");
    }

    return res.render("auth/reset-password");
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmpassword } = req.body;
    

    const isTokenExist = await resetPasswordModel.findOne({ token, tokenExpireTime: {$gt: Date.now() }  });

    if (!isTokenExist) {
      req.flash("error", "Invalid or Expired Token");
      return res.redirect("/auth/forgot-password");
    }

    await ResetPasswordValidationSchema.validate(
      {token, confirmpassword, password },
      { abortEarly: true }
    );

    

    const user = await userModel.findById(isTokenExist.user);

    if(!user){
      req.flash("error", "User not found");
      return res.redirect("/auth/forgot-password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.findByIdAndUpdate({_id: user._id},{password:hashedPassword});


    await resetPasswordModel.findOneAndDelete({_id: isTokenExist._id});

    req.flash("success", "Password reset successfully");
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};
