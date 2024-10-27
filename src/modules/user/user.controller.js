const bcrypt = require("bcryptjs");
const UserModel = require("../../models/user");
const PostModel = require("../../models/Post");
const CommentModel = require("../../models/Comment");
const likeModel = require("../../models/Like");
const saveModel = require("../../models/Save");
const followModel = require("../../models/follow");
const fs = require("fs");
const { updateProfileValidationSchema, updatePasswordValidationSchema } = require("./user.validators");

exports.showPageEditView = async (req, res) => {
  const user = await UserModel.findOne({ _id: req.user._id }).lean();

  return res.render("user/edit.ejs", {
    user
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userID = req.user._id;
    const { name, username, email, bio } = req.body;

    await updateProfileValidationSchema.validate(
      {
        name,
        username,
        email,
        bio
      },
      { abortEarly: false }
    );

    const user = await UserModel.findOne({ _id: userID });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users/edit-profile");
    }

    let newProfilePicture = user.profilePicture;

    if (req.file) {
      const { filename } = req.file;
      const profilepath = `/images/profiles/${filename}`;

      // Delete the old profile picture if it exists
      if (
        user.profilePicture &&
        user.profilePicture !== "/images/notfoundProfile.jpg"
      ) {
        const oldProfilePath = `public/${user.profilePicture}`;

        fs.unlink(oldProfilePath, (err) => {
          if (err) {
            console.error("Failed to delete old profile picture:", err);
          }
        });
      }

      newProfilePicture = profilepath;
    }

    await UserModel.updateOne(
      { _id: userID },
      { name, username, email, bio, profilePicture: newProfilePicture }
    );

    req.flash("success", "Profile Updated Successfully");
    return res.redirect("/users/edit-profile");
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try{
    const userID = req.user._id;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    await updatePasswordValidationSchema.validate( { oldPassword, newPassword, confirmPassword }, { abortEarly: true });

    const user = await UserModel.findOne({ _id: userID});

    if(!user){
      req.flash("error", "User not found");
      return res.redirect("back");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if(!isMatch){
      req.flash("error", "Old password is incorrect");
      return res.redirect("back");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne({ _id: userID }, { password: hashedPassword });

    req.flash("success", "Password Updated Successfully");

    return res.redirect("back");

  }catch(err){
    next(err)
  }
}
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = req.user;

    
    // delete posts of the user
    await PostModel.deleteMany({ user: user._id });
    // delete comments of the user
    await CommentModel.deleteMany({ user: user._id });
    // delete likes of the user
    await likeModel.deleteMany({ user: user._id });
    // delete saves of the user
    await saveModel.deleteMany({ user: user._id });
    // delete followed pages of the user
    await followModel.deleteMany({ following: user._id });
    // delete following pages of the user
    await followModel.deleteMany({ follower: user._id });
    // delete profile picture of the user
    if (user.profilePicture && user.profilePicture !== "/images/notfoundProfile.jpg") {
      const profilePath = `public${user.profilePicture}`;
      fs.unlink(profilePath, (err) => {
        if (err) {
          console.error("Failed to delete profile picture:", err);
        }
      });
    }
    // delete User
    await UserModel.deleteOne({ _id: user._id });

    req.flash("success", "Account Deleted Successfully");
    return res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
};
