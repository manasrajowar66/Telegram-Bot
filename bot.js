require("dotenv").config();
const telegraf = require("telegraf");
const { interpret } = require("xstate");
const { machine } = require("./machine");
const mongoose = require("mongoose");

//mongoDB URL
const dbURL = `mongodb+srv://manasrajowar:${process.env.PASSWORD}@cluster0.gwwmy.mongodb.net/telegram-bot?retryWrites=true&w=majority`;
//connect to mongoDB
mongoose
  .connect(dbURL)
  .then((result) => console.log("connected to db"))
  .catch((err) => console.log(err));

let isAuthenticated, isEmailValidate;

//creating service for machine state
const service = interpret(machine).onTransition((state) => {
  console.log(state.value, state.context);
  isAuthenticated = state.context.isAuthenticated;
  isEmailValidate = state.context.isEmailValidate;
});

service.start();

//Telegraf Bot create
const bot = new telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => {
  ctx.reply("Enter Your Email");
  service.send("START");
});

bot.help((ctx) => {
  ctx.reply("You enter the help command!");
});

bot.settings((ctx) => {
  ctx.reply("You enter the settings command!");
});

bot.on("text", (ctx) => {
  if (!isAuthenticated) {
    if (!isEmailValidate) {
      let email = ctx.message.text;
      service.send({ type: "EMAILVALIDATE", data: { email, ctx } });
    } else {
      let password = ctx.message.text;
      service.send({ type: "PASSWORDVALIDATE", data: { password, ctx } });
    }
  }
});

bot.launch();
