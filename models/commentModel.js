const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: function genUUID() {
      return require("uuid").v4();
    },
  },

  content: {
    type: String,
  },
  likes: [
    {
      type: String,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model(Comment, "commentSchema");
