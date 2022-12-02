const telegraf = require("telegraf");
const { interpret } = require("xstate");
const { machine } = require("../machine");

module.exports = async () => {
  //current state variable
  let currState;

  //creating service for machine state
  const service = interpret(machine).onTransition((state) => {
    //store current state in currState
    currState = state;
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
    if (currState.value === "emailValidate") {
      let email = ctx.message.text;
      service.send({
        type: "EMAILVALIDATE",
        data: { email, ctx },
      });
    } else if (currState.value === "passwordValidate") {
      let password = ctx.message.text;
      service.send({
        type: "PASSWORDVALIDATE",
        data: { password, ctx },
      });
    }
  });

  bot.launch();
};
