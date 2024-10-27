const userModel = require("../../models/user");
const hasAccessToPage = require("../../utils/hasAccessToPage");
const followModel = require("../../models/follow");
const postModel = require("../../models/Post");
const LikeModel = require("../../models/Like");
const SaveModel = require("../../models/Save");
const CommentModel = require("../../models/Comment");
const { getUserInfo } = require("../../utils/Helpers");
//-------------- Get Page Function --------------
exports.getPage = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageID } = req.params;

    //-------------- Check Access --------------
    const hasAccess = await hasAccessToPage(user._id, pageID);
    //-------------- End of Check Access --------------

    //-------------- Check Followed --------------
    const followed = await followModel.findOne({
      follower: user._id,
      following: pageID
    });
    //-------------- End of Check Followed --------------

    //-------------- Fetch Page Info --------------
    const page = await userModel
      .findOne({ _id: pageID }, "name username bio isVerified profilePicture")
      .lean();
    //-------------- End of Fetch Page Info --------------

    //-------------- Fetch Followers --------------
    let followers = await followModel
      .find({ following: pageID })
      .populate("follower", "name username profilePicture");

    followers = followers.map((item) => item.follower);
    //-------------- End of Fetch Followers --------------

    //-------------- Fetch Followings --------------
    let followings = await followModel
      .find({ follower: pageID })
      .populate("following", "name username profilePicture");

    followings = followings.map((item) => item.following);
    //-------------- End of Fetch Followings --------------

    const own = user._id == pageID;

    //-------------- Fetch Posts --------------
    const posts = await postModel
      .find({ user: pageID })
      .sort({ _id: -1 })
      .populate("user", "name username")
      .lean();
    //-------------- End of Fetch Posts --------------

    //-------------- Fetch Likes --------------
    const likes = await LikeModel.find({ user: user._id })
      .populate("user", "_id")
      .populate("post", "_id")
      .lean();
    //-------------- End of Fetch Likes --------------

    //-------------- Fetch Saves --------------
    const saves = await SaveModel.find({ user: user._id })
      .populate("user", "_id")
      .populate("post", "_id")
      .lean();
    //-------------- End of Fetch Saves --------------

    //-------------- Add Likes to Posts --------------
    posts.forEach((post) => {
      likes.forEach((like) => {
        if (like.post._id.toString() === post._id.toString()) {
          post.haslike = true;
        }
      });
    });
    //-------------- End of Add Likes to Posts --------------

    //-------------- Add Saves to Posts --------------
    posts.forEach((post) => {
      saves.forEach((save) => {
        if (save.post._id.toString() === post._id.toString()) {
          post.isSaved = true;
        }
      });
    });
    //-------------- End of Add Saves to Posts --------------

    //-------------- Fetch Comments for Posts --------------
    const postIds = posts.map((post) => post._id);
    const comments = await CommentModel.find({ post: { $in: postIds } })
      .populate("user", "name username profilePicture")
      .sort({ _id: -1 })
      .lean();

    posts.forEach((post) => {
      post.comments = comments
        .filter((comment) => comment.post.toString() === post._id.toString())
        .map((comment) => ({
          ...comment,
          user: {
            name: comment.user.name,
            username: comment.user.username,
            profilePicture: comment.user.profilePicture
          }
        }));
    });

    //-------------- End of Fetch Comments for Posts --------------

    //-------------- Fetch User Info --------------
    const userInfo = await getUserInfo(user._id);
    //-------------- End of Fetch User Info --------------

    //-------------- Fetch Most Followed People --------------
    const peopleFollows = await followModel.aggregate([
      { $group: { _id: "$following", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const mostFollowedPeople = await userModel
      .find(
        {
          _id: { $in: peopleFollows.map((item) => item._id) }
        },
        "name username profilePicture isVerified"
      )
      .lean();
    //-------------- End of Fetch Most Followed People --------------

    //-------------- Fetch Trending Tags --------------
    const trendTags = await postModel.aggregate([
      { $unwind: "$hashtags" },
      { $match: { hashtags: { $ne: "" } } },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    //-------------- End of Fetch Trending Tags --------------

    //-------------- Fetch random Posts --------------
    const randomPosts = await postModel.aggregate([
      { $sample: { size: 9 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          media: 1,
          "user._id": 1,
          "user.name": 1,
          "user.username": 1
        }
      }
    ]);
    //-------------- End of Fetch random Posts --------------

    if (!hasAccess) {
      req.flash("error", "follow page to show content");

      return res.render("page/index", {
        followed: Boolean(followed),
        pageID: pageID,
        hasAccess: false,
        followers: [],
        followings: [],
        page,
        posts,
        own,
        trendTags,
        mostFollowedPeople,
        randomPosts,
        user: userInfo
      });
    }

    return res.render("page/index", {
      followed: Boolean(followed),
      pageID: pageID,
      hasAccess: true,
      followers,
      followings,
      page,
      posts,
      own,
      trendTags,
      mostFollowedPeople,
      randomPosts,
      user: userInfo
    });
  } catch (err) {
    next(err);
  }
};

exports.follow = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageID } = req.params; // Correctly accessing pageID from req.params

    // Check if the page exists using pageID
    const isOwnPage = await userModel.findOne({ _id: pageID });
    if (!isOwnPage) {
      req.flash("error", "Page not found");
      return res.redirect(`/pages/${pageID}`);
    }

    // Check if user is trying to follow themselves
    if (user._id.toString() === pageID) {
      req.flash("error", "You cant follow yourself");
      return res.redirect(`/pages/${pageID}`);
    }

    // Check if the user is already following the page
    const followedAlready = await followModel.findOne({
      follower: user._id,
      following: pageID
    });

    if (followedAlready) {
      req.flash("error", "Page already followed");
      return res.redirect(`/pages/${pageID}`);
    }

    // Create a new follow relationship
    await followModel.create({
      follower: user._id,
      following: pageID
    });

    req.flash("success", "Page followed successfully");
    return res.redirect(`/pages/${pageID}`);
  } catch (err) {
    next(err);
  }
};

exports.unfollow = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageID } = req.params;

    const unFollowedPage = await followModel.findOneAndDelete({
      follower: user._id,
      following: pageID
    });

    if (!unFollowedPage) {
      req.flash("error", "you didnt follow this page");
      return res.redirect(`/pages/${pageID}`);
    }

    req.flash("success", "Page unfollowed successfully");
    return res.redirect(`/pages/${pageID}`);
  } catch (err) {
    next(err);
  }
};
