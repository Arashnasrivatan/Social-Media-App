const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    post:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Post',
       required: true
    },
    user:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
    },
    
  },
  { timestamps: true }
);



const model = mongoose.model("Save", schema);

module.exports = model;
