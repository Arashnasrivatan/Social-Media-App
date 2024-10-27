const { createPostValidator } = require("../../modules/post/post.validator");
const PostModel = require("../../models/Post");
const LikeModel = require("../../models/Like");
const SaveModel = require("../../models/Save");
const CommentModel = require("../../models/Comment");
const hasAccessToPage = require("../../utils/hasAccessToPage");
const { getUserInfo } = require("../../utils/Helpers");
const path = require("path");
const fs = require("fs");

exports.showPostUploadView = async (req, res, next) => {
  try {
    const user = req.user;
    const userInfo = await getUserInfo(user._id);

    return res.render("post/upload", { user: userInfo });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { description, hashtags } = req.body;
    const user = req.user;

    const tags = hashtags.split(",");

    if (!req.file) {
      req.flash("error", "Media is required");
      return res.render("post/upload");
    }

    await createPostValidator.validate(
      {
        description
      },
      { abortEarly: false }
    );

    const mediaUrlPath = `images/posts/${req.file.filename}`;
    const post = new PostModel({
      media: {
        filename: req.file.filename,
        path: mediaUrlPath
      },
      description,
      hashtags: tags,
      user: user._id
    });

    await post.save();

    const userInfo = await getUserInfo(user._id);

    req.flash("success", "post created successfully :)");
    return res.render("post/upload", { user: userInfo });
  } catch (err) {
    next(err);
  }
};

exports.like = async (req, res, next) => {
  try {
    const user = req.user;

    const postID = req.body.postID;

    const post = await PostModel.findOne({ _id: postID });

    if (!post) {
      req.flash("error", "Post not found");
      return res.redirect("back");
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You dont have access to this page");
      return res.redirect("back");
    }

    const alreadyLiked = await LikeModel.findOne({
      post: postID,
      user: user._id
    });

    if (alreadyLiked) {
      return res.redirect("back");
    }

    const like = new LikeModel({
      post: postID,
      user: user._id
    });
    await like.save();

    return res.redirect("back");
  } catch (err) {
    next(err);
  }
};

exports.dislike = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID } = req.body;

    const like = await LikeModel.findOne({ post: postID, user: user._id });

    if (!like) {
      console.log("like not found");
      return res.redirect("back");
    }

    await LikeModel.findByIdAndDelete(like._id);

    return res.redirect("back");
  } catch (err) {
    next(err);
  }
};

exports.save = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID } = req.body;

    const post = await PostModel.findOne({ _id: postID });

    if (!post) {
      return res.redirect("back");
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You dont have access to this page");
      return res.redirect("back");
    }

    const alreadySaved = await SaveModel.findOne({
      post: postID,
      user: user._id
    });

    if (alreadySaved) {
      return res.redirect("back");
    }

    const save = new SaveModel({
      post: postID,
      user: user._id
    });

    await save.save();

    return res.redirect("back");
  } catch (err) {
    next(err);
  }
};

exports.unsave = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID } = req.body;

    const removedsave = await SaveModel.findOneAndDelete({
      user: user._id,
      post: postID
    });

    if (!removedsave) {
      return res.redirect("back");
    }

    return res.redirect("back");
  } catch (err) {
    next(err);
  }
};

exports.showSavesView = async (req, res, next) => {
  try {
    const user = req.user;
    const saves = await SaveModel.find({ user: user._id })
      .populate({
      path: "post",
      populate: {
        path: "user",
        model: "User",
        select: "_id name username profilePicture isVerified"
      }
      })
      .lean();

    const likes = await LikeModel.find({ user: user._id })
      .populate("post")
      .lean();

    saves.forEach((item) => {
      likes.forEach((like) => {
      if (item.post._id.toString() === like.post._id.toString()) {
        item.post.hasLike = true;
      }
      });
    });

    //-------------- Fetch Comments for Saves --------------
    const postIds = saves.map((save) => save.post._id);
    const comments = await CommentModel.find({ post: { $in: postIds } })
      .populate("user", "name username profilePicture")
      .sort({ _id: -1 })
      .lean();

    saves.forEach((save) => {
      save.post.comments = comments
      .filter((comment) => comment.post.toString() === save.post._id.toString())
      .map((comment) => ({
        ...comment,
        user: {
        name: comment.user.name,
        username: comment.user.username,
        profilePicture: comment.user.profilePicture
        }
      }));
    });

    //-------------- End of Fetch Comments for Saves --------------

    const userInfo = await getUserInfo(user._id);

    return res.render("post/saves", {
      posts: saves,
      user: userInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.removePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID } = req.params;

    const post = await PostModel.findOne({ _id: postID });

    if (!post) {
      return res.redirect("back");
    }

    if (post.user.toString() !== user._id.toString()) {
      req.flash("error", "You cant remove this post");
      return res.redirect("back");
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You dont have access to this page");
      return res.redirect("back");
    }

    const mediaPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "images",
      "posts",
      post.media.filename
    );
    fs.unlinkSync(mediaPath, (err) => {
      if (err) {
        next(err);
      }
    });

    await LikeModel.deleteMany({ post: postID });
    await SaveModel.deleteMany({ post: postID });

    await PostModel.findByIdAndDelete(postID);

    req.flash("success", "Post removed successfully");
    return res.redirect("back");
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID, content } = req.body;

    if(!user.isVerified){
      req.flash("error", "You need to verify your account to comment on posts");
      return res.redirect("back");
    }

    const post = await PostModel.findOne({ _id: postID });

    if(!post){
      req.flash("error", "Post not found");
      return res.redirect("back");
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      req.flash("error", "You dont have access to this page");
      return res.redirect("back");
    }

    const newComment = new CommentModel({
      post: postID,
      user: user._id,
      content
    });

    await newComment.save();

    req.flash("success", "Comment added successfully");
    return res.redirect("back");
  } catch (err) {
    next(err);
  }
};
