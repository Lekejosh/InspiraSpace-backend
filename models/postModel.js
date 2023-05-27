const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: function genUUID() {
        return require("uuid").v4();
      },
    },
    body: {
      type: String,
    },
    images: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    isACollection: {
      type: Boolean,
      deafult: false,
    },
    price: {
      type: Number,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    author: {
      type: String,
      ref: "User",
      required: true,
    },
    comments: [
      {
        type: String,
        ref: "Comment",
      },
    ],
    reviews: [
      {
        user: {
          type: String,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        _id: {
          type: String,
          required: true,
          default: function genUUID() {
            return require("uuid").v4();
          },
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
