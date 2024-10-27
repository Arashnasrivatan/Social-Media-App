const express = require("express");
const controller = require("./post.controller.js");
const auth = require("./../../middlewares/auth.js");
const AccountVerify = require("./../../middlewares/AccountVerify.js");
const { multerStorage } = require("../../middlewares/Uploaderconfigs.js")

const upload = multerStorage("public/images/posts", /png|webp|jpeg|jpg|mp4/)

const router = express.Router();

router
  .route("/")
  .get(auth, AccountVerify, controller.showPostUploadView)
  .post(auth, upload.single("media"), controller.createPost);


router.route("/like").post(auth, controller.like);

router.route("/dislike").post(auth, controller.dislike);

router.route("/save").post(auth, controller.save);
router.route("/unsave").post(auth, controller.unsave);

router.route("/saves").get(auth, controller.showSavesView);
router.route("/:postID/remove").post(auth, controller.removePost);

router.route("/new-comment").post(auth, controller.addComment);



module.exports = router;
