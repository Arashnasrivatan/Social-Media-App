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
