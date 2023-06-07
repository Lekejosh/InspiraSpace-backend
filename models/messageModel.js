const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: function genUUID() {
        return require("uuid").v4();
      },
    },
    sender: {
      type: String,
      ref: "User",
    },
    content: {
      message: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        trim: true,
      },
    },
    isDeleted: {
      type: Boolean,
    },
    isDeletedBy: [
      {
        type: String,
        ref: "User",
      },
    ],
    chat: {
      type: String,
      ref: "Chat",
    },
    isReadBy: [
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
module.exports = mongoose.model("Message", messageSchema);
