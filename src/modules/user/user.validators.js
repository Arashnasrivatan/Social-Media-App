const yup = require("yup");

exports.updateProfileValidationSchema = yup.object({
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
  bio: yup.string().optional()
});


exports.updatePasswordValidationSchema = yup.object({
  oldPassword: yup
    .string()
    .min(8, "Password must be at least 8 chars long")
    .required("old Password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 chars long")
    .required("new Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("confirm Password is required")
});

