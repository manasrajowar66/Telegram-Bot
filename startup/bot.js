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
    if (!currState.done) {
      service.send({
        type: "VALIDATE",
        data: { text: ctx.message.text, ctx },
      });
    }
  });

  bot.launch();
};
