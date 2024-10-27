const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    bio: {
      type: String
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      required: false,
      default: "/images/notfoundProfile.jpg"
    },
    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"]
    },
    private: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

schema.pre("save", async function (next) {
  try {
    if(this.password){
    this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

const model = mongoose.model("User", schema);

module.exports = model;
