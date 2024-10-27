const express = require("express");
const userController = require("./user.controller");
const auth = require("../../middlewares/auth");
const { multerStorage } = require("../../middlewares/Uploaderconfigs");

const router = express.Router();
const upload = multerStorage("public/images/profiles/");

router.get("/edit-profile", auth, userController.showPageEditView);

router.post(
  "/profile-picture",
  auth,
  upload.single("profile"),
  userController.updateProfile
);

router.route("/update-password").post(auth, userController.updatePassword);

router.route("/delete-account").get(auth, userController.deleteAccount);

module.exports = router;
