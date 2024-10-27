const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    }
    // parent: {
    //        type: mongoose.Schema.Types.ObjectId,
    //        ref: 'Comment',
    //        default: null
    // }
  },
  { timestamps: true }
);

const model = mongoose.model("Comment", schema);

module.exports = model;
