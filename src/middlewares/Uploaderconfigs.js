const multer = require("multer");
const fs = require("fs");
const path = require("path");

exports.multerStorage = (destination, allowedTypes = /jpeg|jpg|png|webp/) => {
  // create directory if it dosnt exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  // multer configs

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqe = Date.now() * Math.floor(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqe}${ext}`);
    }
  });

  const fileFilter = function (req, file, cb) {
    // Allow ext

    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File Type not Allowed !!"));
    }
  };

  const uploader = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter
  });

  return uploader;
};
