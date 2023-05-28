/*
 * server.js
 * Created By Adeleke Joshua A.
 * 25/05/2023
 */
const app = require("./app");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config();

process.on("uncaughtException", (err) => {
  console.log(`Error: $err: ${err.message}`);
  console.log(`Shutting down the server due to uncaught Expectation`);
  process.exit(1);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

mongoose.set("strictQuery", true);

// console.log("Server is runningggg");
// if (cluster.isMaster) {
//   const NUM_WORKERS = os.cpus().length;
//   console.log(NUM_WORKERS);
//   for (let i = 0; i < NUM_WORKERS; i++) {
//     cluster.fork();
//   }
// }

mongoose
  .connect(`${process.env.DB_URI}/${process.env.DB_NAME}`)
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log(`Server is working on http://localhost:${process.env.PORT}`);
    })
  )
  .catch((err) => {
    console.error(err);
  });

process.on("unhandledRejection", (err) => {
  console.log(`Error: $err: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
