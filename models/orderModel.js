const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: function genUUID() {
        return require("uuid").v4();
      },
    },
    location: {
      postalCode: String,
      country: String,
      state: String,
      houseAddress: String,
    },
    payment: {
      status: {
        type: String,
        enum: ["paid", "fail", "processing"],
        default: "processing",
      },
      _id: String,
    },
    items: [
      {
        artist: {
          type: String,
          ref: "User",
        },
        itemId: {
          type: String,
          ref: "Post",
        },
        price: Number,
        quantity: Number,
        size: String,
        _id: {
          type: String,
          required: true,
          default: function genUUID() {
            return require("uuid").v4();
          },
        },
      },
    ],
    price: Number,
    tax: Number,
    totalAmount: Number,
    isDelivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
