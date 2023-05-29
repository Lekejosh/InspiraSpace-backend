const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: function genUUID() {
        return require("uuid").v4();
      },
    },
    displayName: {
      type: String,
      required: [true, "Please Enter a Display Name"],
      maxLength: [30, "First Name Cannot exceed 30 Characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email Address"],
    },
    password: {
      type: String,
      required: [true, "Please Enter your Password"],
      minLength: [8, "Password should be 8 characters or more"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    username: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
    },

    avatar: {
      public_id: { type: String, default: "default_image" },
      url: {
        type: String,
        default:
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
    },
    bio: {
      type: String,
    },
    location: {
      country: {
        type: String,
      },
      state: {
        type: String,
      },
      postalCode: {
        type: String,
      },
    },
    isDeactivated: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    following: [{ type: String, ref: "User" }],
    followers: [{ type: String, ref: "User" }],
    blocked: [{ type: String, ref: "User" }],
    subscribers: [{ type: String, ref: "User" }],
    generatedOtp: String,
    generatedOtpExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
