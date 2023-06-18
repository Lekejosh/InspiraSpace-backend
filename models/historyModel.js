const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: function genUUID() {
        return require("uuid").v4();
      },
    },
    user: {
      type: String,
      ref: "User",
    },
    details: {
      type: String,
    },
    type: {
      type: String,
      enum: ["transaction", "search"],
    },
    status: {
      type: String,
      enum: ["processing", "success", "canceled"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);
