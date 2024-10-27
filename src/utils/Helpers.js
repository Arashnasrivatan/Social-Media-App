const UserModel = require("../models/user");

const getUserInfo = async (userID) => {
  const user = await UserModel.findOne({ _id: userID });

  return user;
};

module.exports = { getUserInfo };
