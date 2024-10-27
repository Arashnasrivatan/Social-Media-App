const yup = require("yup");

exports.registerValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please Enter a Valid Email")
    .required("Email field is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 chars long")
    .max(24, "Username must be between 3,24 chars long")
    .required("Username is required"),
  name: yup
    .string()
    .min(3, "name must be at least 3 chars long")
    .max(24, "name must be between 3,24 chars long")
    .required("name is required"),
  password: yup
    .string()
    .min(8, "password must be at least 8 chars long")
    .max(24, "password must be between 8,24 chars long")
    .required("password is required")
});

exports.loginValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please Enter a Valid Email")
    .required("Email field is required"),
  password: yup
    .string()
    .min(8, "password must be at least 8 chars long")
    .max(24, "password must be between 8,24 chars long")
    .required("password is required")
});


exports.forgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please Enter a Valid Email")
    .required("Email field is required"),
});

exports.ResetPasswordValidationSchema = yup.object({
  token: yup
    .string()
    .required("Token is required"),
    confirmpassword: yup
      .string()
      .min(8, "confirm password must be at least 8 chars long")
      .max(24, "confirm password must be between 8,24 chars long")
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required("confirm password is required"),
  password: yup
    .string()
    .min(8, "password must be at least 8 chars long")
    .max(24, "password must be between 8,24 chars long")
    .required("password is required")
});


