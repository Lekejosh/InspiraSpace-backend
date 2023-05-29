const mongoose = require("mongoose");

const notificationSchema = require({
  _id: {
    type: String,
    required: true,
    default: function genUUID() {
      return require("uuid").v4();
    },
  },
  type: {
    type: String,
    enum: ["follow", "art", "like", "comment", "mention"],
  },
  followId: {
    type: String,
    ref:"User"
  },
  artId: {
    type: String,
    ref:"Post"
  },
  content: {
    type: String,
  },
  seen: {
    type: Boolean,
  },
  user: {
    type: String,
    ref: "user",
  },
}, {
  timestamps: true,
});
