const { getUserInfo } = require("../../utils/Helpers");

exports.showHomeView = async (req, res, next) => {
  try {
    const user = req.user;
    const userInfo = await getUserInfo(user._id);
    return res.render("index.ejs",{
      user: userInfo
    });
  } catch (err) {
    next(err);
  }
};