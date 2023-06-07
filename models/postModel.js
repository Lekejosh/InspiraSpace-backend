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
    title: {
      type: String,
    },
    description: {
      type: String,
      maxLength: [300, "Description can't be more than 300 Characters"],
    },
    images: [
      {
        type: String,
      },
    ],
    monetize: {
      type: Boolean,
      deafult: false,
    },
    price: {
      type: Number,
    },
    type: [
      {
        type: String,
        enum: [
          "abstract",
          "modern",
          "impressionist",
          "pop",
          "cubism",
          "surrealism",
          "contemporary",
          "Contemporary",
          "fantasy",
          "graffiti",
        ],
      },
    ],
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
