const userModel = require("../models/user");
const followModel = require("../models/follow");

module.exports = async (userID, pageID) => {
  //
  try {
    if (userID == pageID) return true; // if the user is the page owner, return true

    const page = await userModel.findOne({ _id: pageID });

    if (!page.private) return true; // if the page is public, return true

    const followed = await followModel.findOne({
      follower: userID,
      following: pageID
    });

    if (!followed) return false; // if the user is not following the page, return false

    return true;
  } catch (err) {}
};
