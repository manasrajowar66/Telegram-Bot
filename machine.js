require("dotenv").config();
const { createMachine, assign } = require("xstate");
const User = require("./models/User");

//Creting a machine
const machine = createMachine(
  {
    id: "mybotmachine",
    initial: "idle",
    predictableActionArguments: true,
    context: {
      PASSWORD: process.env.FIXED_USER_PASSWORD,
      EMAIL: "",
    },
    states: {
      idle: {
        on: {
          START: "emailValidate",
        },
      },
      emailValidate: {
        on: {
          VALIDATE: {
            target: "passwordValidate",
            cond: "checkEmail",
            actions: "saveEmail",
          },
        },
      },
      passwordValidate: {
        on: {
          VALIDATE: {
            target: "success",
            cond: "checkPassword",
            actions: "savePassword",
          },
        },
      },
      success: {
        type: "final",
      },
    },
  },
  {
    actions: {
      saveEmail: assign((ctx, event) => {
        event.data.ctx.reply("enter password");
        //store email in the context
        return { EMAIL: event.data.text };
      }),
      savePassword: (ctx, event) => {
        //creating new user and saved to database
        const user = new User({
          email: ctx.EMAIL,
        });
        user
          .save()
          .then(() => {
            event.data.ctx.reply("Thanks for using the bot");
          })
          .catch((err) => {
            event.data.ctx.reply("Something Went Wrong!");
          });
      },
    },
    guards: {
      checkPassword: (ctx, event) => {
        if (event.data.text === ctx.PASSWORD) {
          return true;
        } else {
          event.data.ctx.reply("Wrong Password");
          return false;
        }
      },
      checkEmail: (ctx, event) => {
        if (
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(event.data.text)
        ) {
          return true;
        } else {
          event.data.ctx.reply("enter a valid email address");
          return false;
        }
      },
    },
  }
);

module.exports = machine;
