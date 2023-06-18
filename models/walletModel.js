const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
  },
  currency: {
    type: String,
    enum: ["naira", "usd", "gbp", "cad"],
  },
});

module.exports = mongoose.model("Wallet", walletSchema);
