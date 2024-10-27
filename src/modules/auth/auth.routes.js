const express = require("express");
const controller = require("./auth.controller.js");

const router = express.Router();

router
  .route("/register")
  .post(controller.register)
  .get(controller.showRegisterView);

router.route("/refresh").post(controller.refreshToken);

router.route("/login").post(controller.login).get(controller.showLoginView);

router
  .route("/forgot-password")
  .get(controller.showForgotPasswordView)
  .post(controller.forgotPassword); 

router
  .route("/reset-password/:token")
  .get(controller.showResetPasswordView)

router.route("/reset-password").post(controller.resetPassword);

module.exports = router;
