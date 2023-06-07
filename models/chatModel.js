const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: function genUUID() {
        return require("uuid").v4();
      },
    },
    users: [
      {
        type: String,
        ref: "User",
      },
    ],
    latestMessage: {
      type: String,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Chat", chatSchema);
