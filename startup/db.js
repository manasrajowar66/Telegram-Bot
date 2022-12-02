require("dotenv").config();
const mongoose = require("mongoose");

module.exports = async () => {
  //mongoDB URL
  const dbURL = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.gwwmy.mongodb.net/telegram-bot?retryWrites=true&w=majority`;
  //connect to mongoDB
  mongoose
    .connect(dbURL)
    .then((result) => {
      console.log("connected to database successfully.");
    })
    .catch((err) => {
      console.log(err);
      // Exit process with failure
      process.exit(1);
    });
};
