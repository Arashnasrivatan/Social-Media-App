const express = require("express");
const controller = require("./home.controller.js");
const auth = require("../../middlewares/auth.js");

const router = express.Router();

router.route("/").get(auth, controller.showHomeView);

module.exports = router;
