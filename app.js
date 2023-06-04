/*
 * app.js
 * Created By Adeleke Joshua A.
 * 25/05/2023
 */

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const errorMiddleware = require("./middlewares/error");
const helmet = require("helmet");
const passport = require("passport");
const rateLimit = require("express-rate-limit");

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(
  session({
    secret:
      process.env.COOKIE_SECRET ||
      "c613c888f2ffba9a939d8d9be116470fe765b238fd5b579be06dc235fa5bf23a",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: Date.now() + 1000 + 60 * 60 * 24 * 7,
      maxAge: 1000 + 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "You probably shouldn't be here, but...",
    data: {
      service: "inspiraspace-api",
      version: "1.0",
    },
  });
});

const user = require("./routes/userRoute");
const post = require("./routes/postRoute");
const follow = require("./routes/followRoute");
const order = require("./routes/orderRouter");
const admin = require("./routes/adminRoute");
const notification = require("./routes/notificationRoute");
const art = require("./routes/artRoutes");

app.use("/api/v1/user", user);
app.use("/api/v1/post", post);
app.use("/api/v1/follow", follow);
app.use("/api/v1/order", order);
app.use("/api/v1/admin", admin);
app.use("/api/v1/notification", notification);
app.use("/api/v1/art", art);

app.use(errorMiddleware);

module.exports = app;
