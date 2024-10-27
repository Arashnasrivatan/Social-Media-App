const express = require("express");
const controller = require("./page.controller.js");
const auth = require("../../middlewares/auth.js");

const router = express.Router();

router.route("/:pageID").get(auth, controller.getPage);
router.route("/:pageID/follow").post(auth, controller.follow);
router.route("/:pageID/unfollow").post(auth, controller.unfollow);


module.exports = router;
